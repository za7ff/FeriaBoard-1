import { users, comments, type User, type InsertUser, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  createComment(insertComment: InsertComment): Promise<Comment>;
  getAllComments(): Promise<Comment[]>;
  deleteComment(id: string): Promise<boolean>;
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
}

export const storage = new DatabaseStorage();