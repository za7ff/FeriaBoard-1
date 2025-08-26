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
                  className="baguzel-btn flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 hover:from-indigo-500/30 hover:to-purple-600/30 border border-indigo-400/20"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                  Discord
                </a>
                
                <a 
                  href="https://www.tiktok.com/@.ps5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-pink-400/20"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.321 5.562a.631.631 0 0 0-.44-.44A19.29 19.29 0 0 0 12 4.667a19.29 19.29 0 0 0-6.881.456.631.631 0 0 0-.44.44A19.29 19.29 0 0 0 4.223 12c0 2.172.359 4.342.456 6.438a.631.631 0 0 0 .44.44c2.155.24 4.369.456 6.881.456s4.726-.216 6.881-.456a.631.631 0 0 0 .44-.44A19.29 19.29 0 0 0 19.777 12a19.29 19.29 0 0 0-.456-6.438zM10 14.998v-5.996L16 12l-6 2.998z"/>
                  </svg>
                  .ps5
                </a>
                
                <a 
                  href="https://www.tiktok.com/@_pc7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-pink-400/20"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.321 5.562a.631.631 0 0 0-.44-.44A19.29 19.29 0 0 0 12 4.667a19.29 19.29 0 0 0-6.881.456.631.631 0 0 0-.44.44A19.29 19.29 0 0 0 4.223 12c0 2.172.359 4.342.456 6.438a.631.631 0 0 0 .44.44c2.155.24 4.369.456 6.881.456s4.726-.216 6.881-.456a.631.631 0 0 0 .44-.44A19.29 19.29 0 0 0 19.777 12a19.29 19.29 0 0 0-.456-6.438zM10 14.998v-5.996L16 12l-6 2.998z"/>
                  </svg>
                  _pc7
                </a>
                
                <a 
                  href="https://snapchat.com/add/cipws"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 hover:from-yellow-400/30 hover:to-orange-500/30 border border-yellow-400/20"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c3.059 0 5.842 1.154 7.961 3.039 2.119 1.885 3.541 4.389 4.039 7.039v.961c0 6.627-5.373 12-12 12s-12-5.373-12-12V11.078c.498-2.65 1.92-5.154 4.039-7.039C6.158 1.154 8.941 0 12 0zm0 3.273c-2.301 0-4.389.884-5.961 2.324-1.572 1.44-2.578 3.36-2.895 5.542-.033.228-.033.456 0 .684.317 2.182 1.323 4.102 2.895 5.542C7.611 18.805 9.699 19.689 12 19.689s4.389-.884 5.961-2.324c1.572-1.44 2.578-3.36 2.895-5.542.033-.228.033-.456 0-.684-.317-2.182-1.323-4.102-2.895-5.542C16.389 4.157 14.301 3.273 12 3.273z"/>
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