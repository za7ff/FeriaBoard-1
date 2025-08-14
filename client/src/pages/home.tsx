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
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Right-click context menu (only with Shift key for security)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
      }
    };

    const handleClick = () => {
      setShowContextMenu(false);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const handleAdminAccess = () => {
    setLocation("/admin/login");
    setShowContextMenu(false);
  };

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
      
      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed z-50 bg-black/90 border border-white/30 rounded-lg shadow-lg backdrop-blur-sm"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
          data-testid="context-menu"
        >
          <button
            onClick={handleAdminAccess}
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
            data-testid="context-menu-admin"
          >
            Admin Login
          </button>
        </div>
      )}

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