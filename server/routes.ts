import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCommentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get approved comments
  app.get("/api/comments", async (req, res) => {
    try {
      const comments = await storage.getApprovedComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create new comment
  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json({ 
        message: "Comment submitted successfully. It will be reviewed before being published.",
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

  // Get all comments (for moderation)
  app.get("/api/admin/comments", async (req, res) => {
    try {
      const comments = await storage.getAllComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Approve comment
  app.patch("/api/admin/comments/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.approveComment(id);
      if (success) {
        res.json({ message: "Comment approved successfully" });
      } else {
        res.status(404).json({ message: "Comment not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to approve comment" });
    }
  });

  // Delete comment
  app.delete("/api/admin/comments/:id", async (req, res) => {
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
