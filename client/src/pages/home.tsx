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
    // Clear localStorage for testing during development
    localStorage.removeItem('hasSeenWelcome');
    
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      const showTimer = setTimeout(() => {
        setShowWelcome(true);
      }, 500);
      
      const hideTimer = setTimeout(() => {
        setShowWelcome(false);
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 4500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Welcome Animation */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md welcome-overlay">
          <div className="welcome-notification modern-card px-10 py-8 mx-4 max-w-md text-center">
            <div className="welcome-content">
              <div className="mb-4">
                <span className="text-5xl animate-bounce inline-block">👋</span>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2 welcome-text">
                Welcome to
              </h2>
              <h1 className="text-white text-3xl font-bold mb-4 welcome-title">
                Website Feria
              </h1>
              <div className="flex justify-center space-x-2">
                <span className="text-2xl animate-pulse">✨</span>
                <span className="text-2xl animate-pulse delay-150">💫</span>
                <span className="text-2xl animate-pulse delay-300">⭐</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated background shapes */}
      <div className="animated-shapes"></div>

      {/* Admin button */}
      <div className="fixed top-6 right-6 z-20">
        <Button
          onClick={() => setLocation("/admin/login")}
          className="bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg"
          data-testid="button-admin"
        >
          Admin
        </Button>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Name */}
        <h1 className="text-8xl md:text-9xl font-bold mb-12 tracking-wider feria-title">
          Feria
        </h1>

        {/* Comment form */}
        <div className="w-full max-w-lg">
          <div className="modern-card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment..."
                className="modern-input"
                rows={4}
                data-testid="input-comment"
              />
              <Button 
                type="submit" 
                disabled={submitComment.isPending || !comment.trim()}
                className="modern-button w-full"
                data-testid="button-submit-comment"
              >
                {submitComment.isPending ? "Submitting..." : "Submit Comment"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}