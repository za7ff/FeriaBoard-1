import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { insertCommentSchema, type InsertComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home as HomeIcon, User, MessageSquare } from "lucide-react";
import HeroGeometric from "@/components/HeroGeometric";

export default function Home() {
  const [comment, setComment] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();



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
    <div className="min-h-screen bg-[#030303] relative">
      <HeroGeometric />
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="nav-item active">
              <HomeIcon className="w-4 h-4" />
              Home
            </a>
            <button 
              onClick={() => setShowInfo(true)}
              className="nav-item"
              data-testid="button-info"
            >
              <User className="w-4 h-4" />
              About
            </button>
            <a
              href="https://discordapp.com/users/700928520716681237"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item"
              data-testid="link-discord"
            >
              <MessageSquare className="w-4 h-4" />
              Contact
            </a>
          </div>
          
          <button
            onClick={() => setLocation("/admin/login")}
            className="nav-item"
            data-testid="button-admin"
          >
            Admin
          </button>
        </div>
      </nav>



      {/* Personal info modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="baguzel-card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold baguzel-heading">About Me</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-white transition-colors text-xl"
                data-testid="button-close-info"
              >
                ✕
              </button>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <img
                src="https://cdn.discordapp.com/avatars/700928520716681237/adc96beeec6bdc6824d9584607682124.webp"
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-gray-600"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <span className="text-gray-400 font-medium">Name:</span>
                  <span className="text-white ml-2">Meshall alHarbi</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎂</span>
                <div>
                  <span className="text-gray-400 font-medium">Age:</span>
                  <span className="text-white ml-2">20</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <span className="text-gray-400 font-medium">Location:</span>
                  <span className="text-white ml-2">Al-Qassim, Buraydah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center -mt-52">
          {/* Welcome Badge with Animation */}
          <div className="inline-flex flex-col items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-8 py-6 mb-12 hover:scale-105 transition-all duration-300 animate-gentle-glow">
            <span className="text-2xl animate-subtle-wave">👋</span>
            <span className="text-orange-400 font-medium text-lg text-center whitespace-nowrap">Feria Welcome's You!</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-12 baguzel-heading">
            Feria
          </h1>

          {/* CTA Button */}
          <a
            href="#comments"
            className="baguzel-btn text-xl px-8 py-4"
            data-testid="button-cta"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#comments')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
          >
            Comment
          </a>
        </div>
      </section>





      {/* Comment Section */}
      <section id="comments" className="py-16 px-6 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="baguzel-card">
            <h3 className="text-2xl font-bold baguzel-heading mb-6 text-center">Leave a Comment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment..."
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                rows={4}
                data-testid="input-comment"
              />
              <Button 
                type="submit" 
                disabled={submitComment.isPending || !comment.trim()}
                className="baguzel-btn w-full justify-center"
                data-testid="button-submit-comment"
              >
                {submitComment.isPending ? "Submitting..." : "Submit Comment"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}