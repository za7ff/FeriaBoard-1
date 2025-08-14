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
    <div className="min-h-screen modern-bg relative overflow-hidden">
      {/* Welcome Animation */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="welcome-notification modern-card px-8 py-6 mx-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">👋</span>
              <p className="text-white text-xl font-medium">
                Welcome to Website Feria
              </p>
              <span className="text-3xl">✨</span>
            </div>
          </div>
        </div>
      )}

      {/* Geometric decorations */}
      <div className="geometric-shapes"></div>
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Header section */}
        <div className="text-center mb-16 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-wide modern-title">
            Feria
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Transforming Ideas into Engaging Digital Experiences through Innovation and Precision.
          </p>
        </div>

        {/* Comment form section */}
        <div className="w-full max-w-xl">
          <div className="modern-card p-8">
            <h2 className="text-white text-2xl font-semibold mb-6 text-center">Share Your Thoughts</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your message here..."
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
                {submitComment.isPending ? "Submitting..." : "Let's Work Together"}
              </Button>
            </form>
          </div>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl w-full">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">300+</div>
            <div className="text-gray-400 text-sm">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-gray-400 text-sm">Happy Clients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">12+</div>
            <div className="text-gray-400 text-sm">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">250+</div>
            <div className="text-gray-400 text-sm">Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
}