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
            <div className="animate-subtle-wave">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2h-12v2z" fill="#F4D03F"/>
                <ellipse cx="16" cy="18" rx="6" ry="4" fill="#F4D03F"/>
                <path d="M9 16c-1.1 0-2-.9-2-2v-3c0-1.1.9-2 2-2s2 .9 2 2v3c0 1.1-.9 2-2 2z" fill="#F4D03F"/>
                <path d="M13 14v-7c0-1.1.9-2 2-2s2 .9 2 2v7h-4z" fill="#F4D03F"/>
                <path d="M16 14v-8c0-1.1.9-2 2-2s2 .9 2 2v8h-4z" fill="#F4D03F"/>
                <path d="M19 14v-7c0-1.1.9-2 2-2s2 .9 2 2v7h-4z" fill="#F4D03F"/>
                <path d="M22 14v-5c0-1.1.9-2 2-2s2 .9 2 2v5h-4z" fill="#F4D03F"/>
                <ellipse cx="16" cy="16" rx="4" ry="2" fill="#F7DC6F" opacity="0.6"/>
                <path d="M10 19c0 0.5.4 1 1 1h10c.6 0 1-.5 1-1v-1H10v1z" fill="#D4AC0D" opacity="0.3"/>
              </svg>
            </div>
            <span className="text-gray-300 font-medium text-sm">Feria Welcome's You!</span>
          </div>

          {/* Main Heading */}
          <h1 className="md:text-7xl baguzel-heading text-[34px] font-extralight pl-[-5px] pr-[-5px] ml-[-1px] mr-[-1px] mt-[24px] mb-[24px] pt-[17px] pb-[17px]">Meshall .</h1>

          {/* CTA Button */}
          <button
            className="baguzel-btn text-xl px-8 py-4"
            data-testid="button-cta"
            onClick={() => setShowComments(!showComments)}
          >
            Comment
          </button>
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
                  <p className="text-gray-400 text-sm">Contact me on Discord</p>
                </div>
              </div>
              
              <div className="pt-4 scroll-reveal">
                <a 
                  href="https://discord.com/users/700928520716681237"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baguzel-btn w-full flex items-center justify-center gap-2"
                >
                  Contact on Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}