import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCommentSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
// @ts-ignore
import MemoryStore from "memorystore";

// Security: Rate limiting and IP blocking for failed login attempts
class SecurityManager {
  private failedAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();
  private readonly maxAttempts = 5; // Max failed attempts before blocking
  private readonly blockDuration = 15 * 60 * 1000; // 15 minutes block
  private readonly attemptWindow = 5 * 60 * 1000; // 5 minutes window for attempts

  getClientIP(req: any): string {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }

  isBlocked(ip: string): boolean {
    const attempts = this.failedAttempts.get(ip);
    if (!attempts) return false;

    // Check if still blocked
    if (attempts.blockedUntil && Date.now() < attempts.blockedUntil) {
      return true;
    }

    // Reset if block period expired
    if (attempts.blockedUntil && Date.now() >= attempts.blockedUntil) {
      this.failedAttempts.delete(ip);
      return false;
    }

    return false;
  }

  recordFailedAttempt(ip: string): { blocked: boolean; remainingAttempts: number; blockDuration?: number } {
    const now = Date.now();
    const attempts = this.failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };

    // Reset count if outside the attempt window
    if (now - attempts.lastAttempt > this.attemptWindow) {
      attempts.count = 0;
    }

    attempts.count++;
    attempts.lastAttempt = now;

    // Block if exceeded max attempts
    if (attempts.count >= this.maxAttempts) {
      attempts.blockedUntil = now + this.blockDuration;
      this.failedAttempts.set(ip, attempts);
      console.warn(`🔒 IP ${ip} blocked for ${this.blockDuration / 1000 / 60} minutes after ${attempts.count} failed login attempts`);
      return { 
        blocked: true, 
        remainingAttempts: 0, 
        blockDuration: this.blockDuration 
      };
    }

    this.failedAttempts.set(ip, attempts);
    const remaining = this.maxAttempts - attempts.count;
    console.warn(`⚠️ Failed login attempt from IP ${ip}. ${remaining} attempts remaining.`);
    
    return { 
      blocked: false, 
      remainingAttempts: remaining 
    };
  }

  recordSuccessfulLogin(ip: string): void {
    // Clear failed attempts on successful login
    this.failedAttempts.delete(ip);
    console.log(`✅ Successful login from IP ${ip}. Security record cleared.`);
  }

  getBlockTimeRemaining(ip: string): number {
    const attempts = this.failedAttempts.get(ip);
    if (!attempts?.blockedUntil) return 0;
    
    const remaining = attempts.blockedUntil - Date.now();
    return Math.max(0, remaining);
  }
}

const security = new SecurityManager();

// Discord notification function
async function sendDiscordNotification(comment: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("Discord webhook URL not configured");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [{
          title: "New Comment on Feria Website 💬",
          description: comment,
          color: 0x5865F2,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Feria Website"
          }
        }]
      }),
    });

    if (response.ok) {
      console.log("✅ Discord notification sent successfully");
    } else {
      console.error("❌ Failed to send Discord notification:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("❌ Error sending Discord notification:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure persistent sessions with enhanced settings
  const MemoryStoreConstructor = MemoryStore(session);
  const sessionStore = new MemoryStoreConstructor({
    checkPeriod: 86400000, // prune expired entries every 24h
    max: 1000, // maximum number of sessions to store
    ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  
  app.use(session({
    name: 'feria.session', // Custom session name
    secret: process.env.SESSION_SECRET || 'feria-session-secret-key-2025-enhanced',
    resave: true, // Changed to true to ensure session updates are saved
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax' // Improve session persistence
    },
    rolling: true, // Extend session on each request
    unset: 'keep' // Keep session data even if unset
  }));
  // Initialize admin user on startup
  try {
    const adminExists = await storage.getUserByUsername("admin");
    if (!adminExists) {
      await storage.createUser({ username: "admin", password: "newpass123" });
      console.log("✅ Admin user created successfully");
    }
  } catch (error) {
    console.error("❌ Failed to initialize admin user:", error);
  }

  // Create new comment
  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      
      // Send Discord notification
      await sendDiscordNotification(validatedData.content);
      
      res.status(201).json({ 
        message: "Comment submitted successfully.",
        comment 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });

  // Admin login with security protection
  app.post("/api/admin/login", async (req, res) => {
    try {
      const clientIP = security.getClientIP(req);
      
      // Check if IP is blocked
      if (security.isBlocked(clientIP)) {
        const timeRemaining = security.getBlockTimeRemaining(clientIP);
        const minutesRemaining = Math.ceil(timeRemaining / 1000 / 60);
        
        return res.status(429).json({ 
          success: false, 
          message: `IP blocked due to multiple failed attempts. Try again in ${minutesRemaining} minutes.`,
          blocked: true,
          timeRemaining: timeRemaining
        });
      }

      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        const result = security.recordFailedAttempt(clientIP);
        return res.status(400).json({ 
          success: false, 
          message: "Username and password required",
          remainingAttempts: result.remainingAttempts
        });
      }

      const user = await storage.getUserByUsername(username);
      
      if (user && user.password === password) {
        security.recordSuccessfulLogin(clientIP);
        
        // Create persistent session with extended data
        (req.session as any).isAdminAuthenticated = true;
        (req.session as any).adminId = user.id;
        (req.session as any).loginTime = Date.now();
        (req.session as any).lastActivity = Date.now();
        (req.session as any).userAgent = req.get('User-Agent');
        
        // Force session save
        req.session.save((err: any) => {
          if (err) {
            console.error('Session save error:', err);
          } else {
            console.log('✅ Admin session saved successfully');
          }
        });
        
        res.json({ success: true, message: "Login successful" });
      } else {
        const result = security.recordFailedAttempt(clientIP);
        
        if (result.blocked) {
          const minutesBlocked = Math.ceil(result.blockDuration! / 1000 / 60);
          return res.status(429).json({ 
            success: false, 
            message: `Too many failed attempts. IP blocked for ${minutesBlocked} minutes.`,
            blocked: true,
            blockDuration: result.blockDuration
          });
        }
        
        res.status(401).json({ 
          success: false, 
          message: `Invalid credentials. ${result.remainingAttempts} attempts remaining.`,
          remainingAttempts: result.remainingAttempts
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Check admin authentication status with session details
  app.get("/api/admin/status", (req, res) => {
    const session = req.session as any;
    const isAuthenticated = !!session.isAdminAuthenticated;
    
    if (isAuthenticated) {
      // Update last activity on status check
      session.lastActivity = Date.now();
      
      res.json({ 
        authenticated: true, 
        loginTime: session.loginTime,
        lastActivity: session.lastActivity,
        sessionId: req.sessionID,
        sessionMaxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        res.status(500).json({ success: false, message: "Logout failed" });
      } else {
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Logged out successfully" });
      }
    });
  });

  // Middleware to check admin authentication with session refresh
  const requireAdminAuth = (req: any, res: any, next: any) => {
    const session = req.session as any;
    if (session.isAdminAuthenticated) {
      // Refresh session timestamp on each authenticated request
      session.lastActivity = Date.now();
      next();
    } else {
      res.status(401).json({ message: "Authentication required" });
    }
  };

  // Get all comments (for admin)
  app.get("/api/admin/comments", requireAdminAuth, async (req, res) => {
    try {
      const comments = await storage.getAllComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Delete comment (admin only)
  app.delete("/api/admin/comments/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteComment(id);
      if (success) {
        res.json({ message: "Comment deleted successfully" });
      } else {
        res.status(404).json({ message: "Comment not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
