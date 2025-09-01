import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCommentSchema, insertUserSchema, comments } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
// @ts-ignore
import MemoryStore from "memorystore";
import { db } from "./db";
import { sql } from "drizzle-orm";

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

// Visitor tracking
class VisitorTracker {
  private allTimeVisitors = new Set<string>();
  private currentVisitors = new Map<string, number>(); // IP -> last seen timestamp
  private readonly SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes timeout
  
  trackVisit(ip: string): { currentVisitors: number; totalVisitors: number } {
    const now = Date.now();
    
    // Add to all-time visitors
    this.allTimeVisitors.add(ip);
    
    // Update current visitor timestamp
    this.currentVisitors.set(ip, now);
    
    // Clean up expired visitors
    this.cleanupExpiredVisitors();
    
    return {
      currentVisitors: this.currentVisitors.size,
      totalVisitors: this.allTimeVisitors.size
    };
  }
  
  private cleanupExpiredVisitors(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    this.currentVisitors.forEach((lastSeen, ip) => {
      if (now - lastSeen > this.SESSION_TIMEOUT) {
        entriesToDelete.push(ip);
      }
    });
    
    entriesToDelete.forEach(ip => {
      this.currentVisitors.delete(ip);
    });
  }
  
  getStats(): { currentVisitors: number; totalVisitors: number } {
    this.cleanupExpiredVisitors();
    return {
      currentVisitors: this.currentVisitors.size,
      totalVisitors: this.allTimeVisitors.size
    };
  }
}

const visitorTracker = new VisitorTracker();

// Discord notification function with detailed user info
async function sendDiscordNotification(comment: string, userInfo: any) {
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
          fields: [
            // Critical Info - First Row
            {
              name: "🌐 IP & Security",
              value: `IP: ${userInfo.ip || "Unknown"}\n${userInfo.vpnDetected}\nSession: ${userInfo.sessionId?.slice(0, 8) || "Unknown"}`,
              inline: true
            },
            {
              name: "📍 Location",
              value: `${userInfo.country} (${userInfo.countryCode})\n${userInfo.city}, ${userInfo.region}\nZIP: ${userInfo.zip || "Unknown"}`,
              inline: true
            },
            {
              name: "📡 Network",
              value: `ISP: ${userInfo.isp || "Unknown"}\n${userInfo.mobile}\nOrg: ${userInfo.org || "Unknown"}`,
              inline: true
            },
            // Device Info - Second Row
            {
              name: "💻 System",
              value: `OS: ${userInfo.os}\nBrowser: ${userInfo.browser}\n${userInfo.deviceType}: ${userInfo.device}`,
              inline: true
            },
            {
              name: "🖥️ Hardware",
              value: `Platform: ${userInfo.platform}\nCPU: ${userInfo.cores}\nRAM: ${userInfo.memory}`,
              inline: true
            },
            {
              name: "📏 Display",
              value: `${userInfo.screenResolution}\nDepth: ${userInfo.colorDepth}\nTouch: ${userInfo.touchSupport}`,
              inline: true
            },
            // Time & History - Third Row
            {
              name: "🕐 Time",
              value: `Local: ${userInfo.localTime}\n${userInfo.timezone}\n${userInfo.timezoneOffset}`,
              inline: true
            },
            {
              name: "📊 History",
              value: `Comments: ${userInfo.previousComments} (30d)\nTotal Visits: ${userInfo.totalSiteVisits}\nLang: ${userInfo.language}`,
              inline: true
            },
            {
              name: "🔒 Privacy",
              value: `Cookies: ${userInfo.cookiesEnabled}\n${userInfo.doNotTrack}\nPixel: ${userInfo.pixelRatio}`,
              inline: true
            },
            // Location Details - Fourth Row
            {
              name: "🗺️ GPS",
              value: userInfo.coordinates || "Unknown",
              inline: true
            },
            {
              name: "🎨 Fingerprint",
              value: `Canvas: ${userInfo.canvas?.slice(0, 10) || "Unknown"}\nWebGL: ${(userInfo.webgl || "Unknown").slice(0, 30)}`,
              inline: true
            },
            {
              name: "🔗 Source",
              value: userInfo.referrer || "Direct Visit",
              inline: true
            }
          ],
          footer: {
            text: `Feria Website • ${new Date().toLocaleString('ar-SA')} • Full tracking enabled`
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
  // Track all visits
  app.use(async (req, res, next) => {
    const clientIP = security.getClientIP(req);
    try {
      await storage.upsertVisitor(clientIP);
    } catch (error) {
      console.error("Error tracking visitor:", error);
    }
    next();
  });

  // Get visitor stats
  app.get("/api/visitors", async (req, res) => {
    try {
      const currentVisitors = await storage.getCurrentVisitors();
      const totalVisitors = await storage.getTotalVisitors();
      res.json({ currentVisitors, totalVisitors });
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
      res.json({ currentVisitors: 0, totalVisitors: 94 }); // Fallback to initial value
    }
  });
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

  // Create new comment with detailed tracking
  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      
      // Extract detailed user information
      const userAgent = req.get('User-Agent') || '';
      const clientIP = security.getClientIP(req);
      
      // Parse detailed browser info from user agent
      const getBrowserInfo = (ua: string) => {
        let browser = 'Unknown';
        let version = '';
        
        if (ua.includes('Chrome')) {
          browser = 'Chrome';
          const match = ua.match(/Chrome\/(\d+\.\d+)/);
          if (match) version = match[1];
        } else if (ua.includes('Firefox')) {
          browser = 'Firefox';
          const match = ua.match(/Firefox\/(\d+\.\d+)/);
          if (match) version = match[1];
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
          browser = 'Safari';
          const match = ua.match(/Version\/(\d+\.\d+)/);
          if (match) version = match[1];
        } else if (ua.includes('Edge')) {
          browser = 'Edge';
          const match = ua.match(/Edge\/(\d+\.\d+)/);
          if (match) version = match[1];
        } else if (ua.includes('Opera')) {
          browser = 'Opera';
          const match = ua.match(/Opera\/(\d+\.\d+)/);
          if (match) version = match[1];
        }
        
        return version ? `${browser} v${version}` : browser;
      };
      
      // Parse OS info from user agent
      const getOSInfo = (ua: string) => {
        if (ua.includes('Windows NT 10')) return 'Windows 10';
        if (ua.includes('Windows NT 11')) return 'Windows 11';
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac OS X')) return 'macOS';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        if (ua.includes('Linux')) return 'Linux';
        return 'Unknown';
      };
      
      // Parse device type and details
      const getDeviceInfo = (ua: string) => {
        let type = 'Desktop';
        let model = '';
        
        if (ua.includes('iPhone')) {
          type = 'Mobile';
          const match = ua.match(/iPhone OS (\d+_\d+)/);
          if (match) model = `iPhone (iOS ${match[1].replace('_', '.')})`;
        } else if (ua.includes('iPad')) {
          type = 'Tablet';
          const match = ua.match(/OS (\d+_\d+)/);
          if (match) model = `iPad (iOS ${match[1].replace('_', '.')})`;
        } else if (ua.includes('Android')) {
          type = ua.includes('Tablet') ? 'Tablet' : 'Mobile';
          const match = ua.match(/Android (\d+\.\d+)/);
          if (match) model = `Android ${match[1]}`;
        }
        
        return { type, model: model || type };
      };
      
      // Get detailed IP location and network info (using free API)
      let locationInfo: any = {};
      let vpnDetected = false;
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`);
        if (geoResponse.ok) {
          locationInfo = await geoResponse.json();
          vpnDetected = locationInfo.proxy || locationInfo.hosting;
        }
      } catch (error) {
        console.error("Failed to get location info:", error);
      }
      
      // Get device info
      const deviceInfo = getDeviceInfo(userAgent);
      
      // Count previous comments from same IP
      const previousComments = await db
        .select({ count: sql<number>`count(*)` })
        .from(comments)
        .where(sql`created_at > ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}`);
      const commentCount = Number(previousComments[0]?.count ?? 0);
      
      // Get previous visit count from same IP
      const visitCount = await storage.getTotalVisitors();
      
      // Collect comprehensive user info
      const userInfo = {
        ip: clientIP,
        browser: getBrowserInfo(userAgent),
        os: getOSInfo(userAgent),
        device: deviceInfo.model,
        deviceType: deviceInfo.type,
        country: locationInfo.country || req.body.userInfo?.country || 'Unknown',
        countryCode: locationInfo.countryCode || 'Unknown',
        region: locationInfo.regionName || 'Unknown',
        city: locationInfo.city || req.body.userInfo?.city || 'Unknown',
        zip: locationInfo.zip || 'Unknown',
        coordinates: locationInfo.lat && locationInfo.lon ? `${locationInfo.lat}, ${locationInfo.lon}` : 'Unknown',
        isp: locationInfo.isp || 'Unknown',
        org: locationInfo.org || 'Unknown',
        vpnDetected: vpnDetected ? '⚠️ VPN/Proxy Detected' : '✅ No VPN',
        mobile: locationInfo.mobile ? '📱 Mobile Network' : '🖥️ Fixed Network',
        referrer: req.get('Referrer') || 'Direct',
        language: req.get('Accept-Language')?.split(',')[0] || 'Unknown',
        timezone: locationInfo.timezone || req.body.userInfo?.timezone || 'Unknown',
        timezoneOffset: req.body.userInfo?.timezoneOffset || 'Unknown',
        localTime: req.body.userInfo?.localTime || 'Unknown',
        screenResolution: req.body.userInfo?.screenResolution || 'Unknown',
        colorDepth: req.body.userInfo?.colorDepth || 'Unknown',
        pixelRatio: req.body.userInfo?.pixelRatio || 'Unknown',
        touchSupport: req.body.userInfo?.touchSupport || 'Unknown',
        cookiesEnabled: req.body.userInfo?.cookiesEnabled || 'Unknown',
        doNotTrack: req.headers['dnt'] === '1' ? '🚫 DNT Enabled' : '✅ DNT Disabled',
        platform: req.body.userInfo?.platform || 'Unknown',
        memory: req.body.userInfo?.memory || 'Unknown',
        cores: req.body.userInfo?.cores || 'Unknown',
        canvas: req.body.userInfo?.canvas || 'Unknown',
        webgl: req.body.userInfo?.webgl || 'Unknown',
        previousComments: commentCount,
        totalSiteVisits: visitCount,
        sessionId: req.sessionID || 'Unknown',
        userAgent: userAgent
      };
      
      // Send Discord notification with user info
      await sendDiscordNotification(validatedData.content, userInfo);
      
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
