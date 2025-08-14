import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { insertCommentSchema, type InsertComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Home() {
  const [comment, setComment] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Show welcome animation on page load
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setTimeout(() => setShowWelcome(true), 1000);
      setTimeout(() => {
        setShowWelcome(false);
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 4000);
    }
  }, []);

  // Handle admin access via context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        setLocation("/admin/login");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [setLocation]);

  // Submit comment mutation
  const submitComment = useMutation({
    mutationFn: async (data: InsertComment) => {
      const response = await apiRequest("POST", "/api/comments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment submitted!",
        description: "Your comment has been added.",
      });
      setComment("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit comment.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const result = insertCommentSchema.safeParse({ content: comment });
    if (!result.success) {
      toast({
        title: "Error",
        description: "Comment cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    submitComment.mutate(result.data);
  };

  return (
    <div className="min-h-screen animated-bg relative">
      {/* Welcome Animation */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="welcome-notification bg-black/80 border border-white/30 rounded-lg px-8 py-6 mx-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">🎉</span>
              <p className="text-white text-xl font-medium">
                Welcome to Website Feria
              </p>
              <span className="text-3xl">✨</span>
            </div>
          </div>
        </div>
      )}

      <div className="floating-particles"></div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Name */}
        <h1 className="text-8xl md:text-9xl font-bold text-white mb-12 tracking-wider glow-text">
          Feria
        </h1>

        {/* Comment form */}
        <div className="w-full max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment..."
              className="bg-black/50 border-white/20 text-white placeholder:text-white/50 resize-none"
              rows={4}
              data-testid="input-comment"
            />
            <Button 
              type="submit" 
              disabled={submitComment.isPending || !comment.trim()}
              className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-50"
              data-testid="button-submit-comment"
            >
              {submitComment.isPending ? "Submitting..." : "Submit Comment"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}