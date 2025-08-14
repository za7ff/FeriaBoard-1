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
  const [keySequence, setKeySequence] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Secret admin access via keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newSequence = keySequence + e.key.toLowerCase();
      setKeySequence(newSequence);
      
      if (newSequence.includes("admin")) {
        setLocation("/admin/login");
        setKeySequence("");
      }
      
      // Reset sequence if it gets too long
      if (newSequence.length > 10) {
        setKeySequence("");
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [keySequence, setLocation]);

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
              placeholder="Write your comment..."
              className="w-full h-20 bg-black/50 border-white/30 text-white placeholder-white/50 text-base resize-none"
              data-testid="textarea-comment"
            />
            <Button
              type="submit"
              disabled={submitComment.isPending || !comment.trim()}
              className="w-full bg-white text-black hover:bg-gray-200 text-base py-2"
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