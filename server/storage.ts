import { type User, type InsertUser, type Comment, type InsertComment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createComment(comment: InsertComment): Promise<Comment>;
  getApprovedComments(): Promise<Comment[]>;
  getAllComments(): Promise<Comment[]>;
  approveComment(id: string): Promise<boolean>;
  deleteComment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.comments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      approved: false,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getApprovedComments(): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.approved)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllComments(): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async approveComment(id: string): Promise<boolean> {
    const comment = this.comments.get(id);
    if (comment) {
      comment.approved = true;
      this.comments.set(id, comment);
      return true;
    }
    return false;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }
}

export const storage = new MemStorage();
