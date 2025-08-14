import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { insertCommentSchema, type InsertComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Home() {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize background music
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.2; // 20% volume
      audio.loop = true;
      
      // Try to play music, but handle autoplay restrictions
      const playMusic = async () => {
        try {
          await audio.play();
        } catch (error) {
          // Autoplay blocked, music will start on first user interaction
          console.log("Autoplay blocked, music will start on user interaction");
        }
      };
      
      playMusic();
      
      // Start music on any user interaction if not already playing
      const startMusicOnInteraction = () => {
        if (audio.paused) {
          audio.play().catch(() => {});
        }
      };
      
      document.addEventListener('click', startMusicOnInteraction);
      document.addEventListener('keypress', startMusicOnInteraction);
      
      return () => {
        document.removeEventListener('click', startMusicOnInteraction);
        document.removeEventListener('keypress', startMusicOnInteraction);
      };
    }
  }, []);



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
      {/* Hidden background music */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="https://cdn.pixabay.com/audio/2022/03/21/audio_4b738d7c56.mp3" type="audio/mpeg" />
      </audio>
      
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
          
          {/* Admin button in top right corner */}
          <div className="fixed top-6 right-6 z-50">
            <button
              onClick={() => setLocation("/admin/login")}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-full transition-all duration-300 text-base font-bold shadow-2xl backdrop-blur-sm transform hover:scale-105"
              data-testid="link-admin"
            >
              ⚙️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}