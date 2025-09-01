import { users, comments, visitors, siteStats, type User, type InsertUser, type Comment, type InsertComment, type Visitor, type InsertVisitor, type SiteStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, sql } from "drizzle-orm";

export interface IStorage {
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  createComment(insertComment: InsertComment): Promise<Comment>;
  getAllComments(): Promise<Comment[]>;
  deleteComment(id: string): Promise<boolean>;
  
  // Visitor tracking methods
  upsertVisitor(ipAddress: string): Promise<void>;
  getCurrentVisitors(): Promise<number>;
  getTotalVisitors(): Promise<number>;
  cleanupOldVisitors(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getAllComments(): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .orderBy(desc(comments.createdAt));
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Visitor tracking implementation
  async upsertVisitor(ipAddress: string): Promise<void> {
    // Try to update existing visitor
    const existingVisitor = await db
      .select()
      .from(visitors)
      .where(eq(visitors.ipAddress, ipAddress))
      .limit(1);

    if (existingVisitor.length > 0) {
      // Update last seen time
      await db
        .update(visitors)
        .set({ lastSeen: new Date() })
        .where(eq(visitors.ipAddress, ipAddress));
    } else {
      // Create new visitor
      await db
        .insert(visitors)
        .values({ ipAddress, lastSeen: new Date() });
      
      // Increment total visitors count
      const stats = await db.select().from(siteStats).where(eq(siteStats.id, 'main')).limit(1);
      if (stats.length > 0) {
        await db
          .update(siteStats)
          .set({ 
            totalVisitors: sql`${siteStats.totalVisitors} + 1`,
            updatedAt: new Date()
          })
          .where(eq(siteStats.id, 'main'));
      } else {
        // Initialize stats if not exists
        await db
          .insert(siteStats)
          .values({ id: 'main', totalVisitors: 95 }); // Start with 95 (94 + 1 new visitor)
      }
    }
  }

  async getCurrentVisitors(): Promise<number> {
    // Count visitors seen in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(visitors)
      .where(gte(visitors.lastSeen, fiveMinutesAgo));
    
    return Number(result[0]?.count ?? 0);
  }

  async getTotalVisitors(): Promise<number> {
    const stats = await db.select().from(siteStats).where(eq(siteStats.id, 'main')).limit(1);
    
    if (stats.length === 0) {
      // Initialize stats if not exists
      await db
        .insert(siteStats)
        .values({ id: 'main', totalVisitors: 94 });
      return 94;
    }
    
    return stats[0].totalVisitors;
  }

  async cleanupOldVisitors(): Promise<void> {
    // Remove visitors not seen in last 30 days (but keep their count in total)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await db
      .delete(visitors)
      .where(sql`${visitors.lastSeen} < ${thirtyDaysAgo}`);
  }
}

export const storage = new DatabaseStorage();