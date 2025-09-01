import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertCommentSchema, type InsertComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home as HomeIcon, User, MessageSquare, Eye } from "lucide-react";
import HeroGeometric from "@/components/HeroGeometric";
import videoFile from "@assets/F83479B6-9F45-4FF7-9499-FA683AA9A46B_1756696203406.mp4";

export default function Home() {
  const [comment, setComment] = useState("");

  const [showComments, setShowComments] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [typingComplete, setTypingComplete] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [typewriterStarted, setTypewriterStarted] = useState(false);

  // Fetch visitor stats
  const { data: visitorStats } = useQuery<{ currentVisitors: number; totalVisitors: number }>({
    queryKey: ['/api/visitors'],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time data
  });

  // Enhanced scroll animation setup
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const elementVisible = 100;
        
        // More sensitive detection for smoother animations
        if (elementTop < window.innerHeight - elementVisible && elementBottom > 0) {
          element.classList.add('revealed');
          
          // Trigger typewriter when About section is visible
          if (element.classList.contains('typewriter-trigger') && !typewriterStarted) {
            setShowTypewriter(true);
            setTypewriterStarted(true);
          }
        }
      });
    };

    // Throttle scroll for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  // Simple typewriter effect
  useEffect(() => {
    if (showTypewriter && !typingComplete) {
      const text = "Hi, I'm Meshall";
      let index = 0;
      
      // Reset states
      setTypewriterText("");
      setTypingComplete(false);
      
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setTypewriterText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setTypingComplete(true);
          }, 500);
        }
      }, 120);

      return () => {
        clearInterval(typeInterval);
      };
    }
  }, [showTypewriter]);


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
      setShowComments(false);
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 p-6 relative bg-black/80 backdrop-blur-sm border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-8">
            <a 
              href="#home" 
              className="nav-item active"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Home
            </a>
            <a 
              href="#about"
              className="nav-item"
              data-testid="link-about"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              About
            </a>
            <a
              href="#contact"
              className="nav-item"
              data-testid="link-contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contact
            </a>
            <button
              className="nav-item"
              data-testid="button-secret"
              onClick={() => setShowVideo(true)}
            >
              Secret
            </button>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center -mt-52">
          {/* Welcome Badge with Animation */}
          <div className="inline-flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-full px-5 py-3 mb-12 hover:scale-105 transition-all duration-300">
            <span className="text-lg animate-subtle-wave">👋</span>
            <span className="text-gray-300 font-medium text-sm">Feria Welcome's You!</span>
          </div>

          {/* Main Heading */}

          {/* CTA Button */}
          <div className="flex flex-col gap-4">
            <button
              className="baguzel-btn text-xl px-8 py-4"
              data-testid="button-cta"
              onClick={() => setShowComments(!showComments)}
            >
              Comment
            </button>
            

          </div>

          {/* Visitor Stats */}
          {visitorStats && (
            <div className="mt-16 grid grid-cols-2 gap-6 max-w-md mx-auto scroll-reveal">
              <div className="baguzel-card text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-gray-400">Online Now</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {visitorStats?.currentVisitors?.toLocaleString() || 0}
                </div>
              </div>
              
              <div className="baguzel-card text-center">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-400">Total Visitors</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {visitorStats?.totalVisitors?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* Comment Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="baguzel-card max-w-md w-full modal-enter">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold baguzel-heading">Comment</h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:text-white transition-colors text-xl"
                data-testid="button-close-comments"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment..."
                className="w-full p-4 bg-[#120f0f00] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
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
      )}
      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-normal mb-8 baguzel-heading scroll-reveal">About</h2>
          <p className="text-gray-300 text-lg mb-12 scroll-reveal">Learn more about me</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-left scroll-reveal-left typewriter-trigger">
              <h3 className="text-2xl font-bold text-white mb-4 min-h-[2rem]">
                {showTypewriter ? (
                  <div className="typewriter-container">
                    {typewriterText.split('').map((char, index) => (
                      <span 
                        key={index}
                        className="typewriter-char"
                        style={{ 
                          animationDelay: `${index * 0.1}s`,
                          display: char === ' ' ? 'inline' : 'inline-block'
                        }}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    ))}
                    {!typingComplete && <span className="typewriter-cursor"></span>}
                  </div>
                ) : (
                  "Hi, I'm Meshall"
                )}
              </h3>
              <p className="text-gray-300 mb-6">
                A 20-year-old passionate developer from Al-Qassim, Buraydah. 
                I love creating modern web applications and exploring new technologies.
              </p>
              <p className="text-gray-300 mb-6">I am a university student majoring in mobile application development. I also have a good background in web development, with intermediate-level experience in both frontend and backend programming. I’m passionate about creating clean, efficient, and user-friendly applications. I enjoy learning new technologies and constantly improving my skills to stay up to date with the latest trends in the tech world.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 scroll-reveal">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span className="text-gray-300">Mobile application development</span>
                </div>
                <div className="flex items-center gap-2 scroll-reveal">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span className="text-gray-300">Web development
</span>
                </div>
                <div className="flex items-center gap-2 scroll-reveal">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span className="text-gray-300">UI/UX Design</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center scroll-reveal-right">
              <div className="relative">
                <img
                  src="https://cdn.discordapp.com/avatars/700928520716681237/adc96beeec6bdc6824d9584607682124.webp"
                  alt="Meshall alHarbi"
                  className="w-48 h-48 rounded-full border-4 border-white/30"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center px-6 py-16 relative z-10 bg-gray-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 baguzel-heading scroll-reveal">Contact</h2>
          <p className="text-gray-300 text-lg mb-12 scroll-reveal">Get in touch with me</p>
          
          <div className="baguzel-card max-w-md mx-auto scroll-reveal-scale">
            <div className="space-y-6">
              <div className="flex items-center gap-4 scroll-reveal">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src="https://cdn.discordapp.com/avatars/700928520716681237/adc96beeec6bdc6824d9584607682124.webp"
                    alt="Meshall"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-white font-medium">Meshall</h4>
                  <p className="text-gray-400 text-sm">Follow me on social media</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 scroll-reveal max-w-xs mx-auto">
                <a 
                  href="https://discord.com/users/700928520716681237"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#5865F2]/20 to-[#5865F2]/10 hover:from-[#5865F2]/30 hover:to-[#5865F2]/20 border border-[#5865F2]/30 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 127.14 96.36">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                  </svg>
                  Discord
                </a>
                
                <a 
                  href="https://www.tiktok.com/@.ps5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#FF0050]/20 to-[#FF0050]/10 hover:from-[#FF0050]/30 hover:to-[#FF0050]/20 border border-[#FF0050]/30 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.527.02C13.858 0 15.188.01 16.52 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  TikTok
                </a>
                
                <a 
                  href="https://www.tiktok.com/@_pc7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#FF0050]/20 to-[#FF0050]/10 hover:from-[#FF0050]/30 hover:to-[#FF0050]/20 border border-[#FF0050]/30 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.527.02C13.858 0 15.188.01 16.52 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Popup Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
              data-testid="button-close-video"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              <video
                controls
                autoPlay
                className="w-full h-full"
                data-testid="video-player"
              >
                <source src={videoFile} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}