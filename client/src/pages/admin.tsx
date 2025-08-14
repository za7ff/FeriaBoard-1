import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Comment } from "@shared/schema";
import { Home } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Admin page is now public - no authentication required
    setIsLoggedIn(true);
  }, []);

  // Admin comments query
  const { data: adminComments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments"],
    enabled: isLoggedIn,
  });





  // Show loading while checking authentication
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen animated-bg relative flex items-center justify-center">
        <div className="floating-particles"></div>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg relative">
      <div className="floating-particles"></div>
      
      <div className="relative z-10 min-h-screen px-6 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white hover:text-gray-300 transition-colors">
                <Home size={24} />
              </Link>
              <h1 className="text-3xl font-bold text-white">Comments Dashboard</h1>
            </div>

          </div>

          {/* Comments section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                All Comments ({adminComments.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/20 rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : adminComments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 text-lg">No comments yet.</p>
                <p className="text-white/40 text-sm mt-2">
                  Comments will appear here when visitors submit them.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    data-testid={`comment-${comment.id}`}
                  >
                    <div>
                      <p className="text-white text-lg mb-3 leading-relaxed" data-testid={`text-content-${comment.id}`}>
                        "{comment.content}"
                      </p>
                      <p className="text-white/50 text-sm" data-testid={`text-date-${comment.id}`}>
                        {format(new Date(comment.createdAt), "PPpp")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}