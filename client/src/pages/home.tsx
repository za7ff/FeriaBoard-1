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

  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [typingComplete, setTypingComplete] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [typewriterStarted, setTypewriterStarted] = useState(false);

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
              <p className="text-gray-300 mb-6">
                Currently focused on full-stack development with React, Node.js, 
                and modern web technologies. Always eager to learn and take on new challenges.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 scroll-reveal">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span className="text-gray-300">Frontend Development</span>
                </div>
                <div className="flex items-center gap-2 scroll-reveal">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span className="text-gray-300">Backend Development</span>
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
              
              <div className="grid grid-cols-2 gap-3 scroll-reveal">
                <a 
                  href="https://discord.com/users/700928520716681237"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-2 p-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                  Discord
                </a>
                
                <a 
                  href="https://www.tiktok.com/@.ps5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-pink-500/20 to-blue-500/20 hover:from-pink-500/30 hover:to-blue-500/30"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  .ps5
                </a>
                
                <a 
                  href="https://www.tiktok.com/@_pc7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-pink-500/20 to-blue-500/20 hover:from-pink-500/30 hover:to-blue-500/30"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  _pc7
                </a>
                
                <a 
                  href="https://snapchat.com/add/cipws"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 hover:from-yellow-400/30 hover:to-yellow-600/30"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.423-6.038 1.423-6.038s-.362-.725-.362-1.797c0-1.683.977-2.939 2.192-2.939 1.035 0 1.535.775 1.535 1.71 0 1.04-.66 2.59-.999 4.032-.284 1.199.6 2.177 1.774 2.177 2.13 0 3.768-2.246 3.768-5.487 0-2.868-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.754-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                  cipws
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}