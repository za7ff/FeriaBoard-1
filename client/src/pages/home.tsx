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
  const [showInfo, setShowInfo] = useState(false);
  const [infoAnimating, setInfoAnimating] = useState(false);
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

      {/* Information Modal */}
      {showInfo && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md info-overlay ${infoAnimating ? 'info-fade-out' : ''}`}>
          <div className={`info-modal modern-card p-8 mx-4 max-w-lg text-center relative overflow-hidden ${infoAnimating ? 'info-modal-fade-out' : ''}`}>
            {/* Animated background particles for modal */}
            <div className="modal-particles">
              <div className="modal-particle modal-particle-1"></div>
              <div className="modal-particle modal-particle-2"></div>
              <div className="modal-particle modal-particle-3"></div>
              <div className="modal-particle modal-particle-4"></div>
            </div>
            
            <Button
              onClick={() => {
                setInfoAnimating(true);
                setTimeout(() => {
                  setShowInfo(false);
                  setInfoAnimating(false);
                }, 600);
              }}
              className="absolute top-4 right-4 bg-red-500/20 border border-red-500/30 text-white hover:bg-red-500/30 backdrop-blur-sm px-3 py-2 rounded-lg text-sm z-10 close-button"
              data-testid="button-close-info"
            >
              ×
            </Button>
            
            <div className="mb-8 z-10 relative">
              <div className="avatar-container w-32 h-32 mx-auto mb-6 relative">
                <div className="avatar-glow"></div>
                <div className="avatar rounded-full overflow-hidden relative z-10 border-4 border-white/30">
                  <img 
                    src="https://cdn.discordapp.com/avatars/700928520716681237/adc96beeec6bdc6824d9584607682124.webp" 
                    alt="Meshall alHarbi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="avatar-ring"></div>
              </div>
              <h2 className="text-white text-3xl font-bold mb-3 info-title">
                Information about me
              </h2>
              <div className="title-underline"></div>
            </div>
            
            <div className="info-content space-y-6 z-10 relative">
              <div className="info-item">
                <div className="info-icon">👤</div>
                <div className="info-text">
                  <span className="text-gray-300 font-semibold text-lg">Name:</span>
                  <span className="text-white text-lg ml-3 info-value">Meshall alHarbi</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">🎂</div>
                <div className="info-text">
                  <span className="text-gray-300 font-semibold text-lg">Age:</span>
                  <span className="text-white text-lg ml-3 info-value">20</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">📍</div>
                <div className="info-text">
                  <span className="text-gray-300 font-semibold text-lg">Location:</span>
                  <span className="text-white text-lg ml-3 info-value">Al-Qassim, Buraydah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Luxury elegant background */}
      <div className="luxury-background"></div>
      


      {/* Buttons */}
      <div className="fixed top-6 right-6 z-20 flex flex-col space-y-3">
        <Button
          onClick={() => {
            setShowInfo(true);
            setInfoAnimating(false);
          }}
          className="bg-blue-500/20 border border-blue-500/30 text-white hover:bg-blue-500/30 backdrop-blur-sm px-6 py-3 rounded-lg"
          data-testid="button-info"
        >
          Feria
        </Button>
        <a
          href="https://discord.com/users/2wo."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-500/20 border border-indigo-500/30 text-white hover:bg-indigo-500/30 backdrop-blur-sm px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
          data-testid="link-discord"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418Z"/>
          </svg>
          2wo.
        </a>
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