import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertCommentSchema, type InsertComment, type Comment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const [comment, setComment] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Admin comments query
  const { data: adminComments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments"],
    enabled: isLoggedIn,
  });

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
      if (isLoggedIn) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit comment.",
        variant: "destructive",
      });
    },
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsLoggedIn(true);
        setShowLogin(false);
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      }
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid credentials.",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/comments/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment deleted",
        description: "Comment has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment.",
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  return (
    <div className="min-h-screen animated-bg relative">
      <div className="floating-particles"></div>
      
      {/* Hidden admin login trigger */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => setShowLogin(true)}
          className="w-2 h-2 bg-transparent hover:bg-white/10 transition-colors duration-300"
          data-testid="admin-login-trigger"
        ></button>
      </div>

      {/* Admin Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="bg-black border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Admin Login</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-900 border-white/30 text-white"
              data-testid="input-username"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-900 border-white/30 text-white"
              data-testid="input-password"
            />
            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-gray-200"
              disabled={login.isPending}
              data-testid="button-login"
            >
              {login.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Name */}
        <h1 className="text-8xl md:text-9xl font-bold text-white mb-12 tracking-wider">
          Feria
        </h1>

        {/* Comment form */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full h-32 bg-black/50 border-white/30 text-white placeholder-white/50 text-lg resize-none"
              data-testid="textarea-comment"
            />
            <Button
              type="submit"
              disabled={submitComment.isPending || !comment.trim()}
              className="w-full bg-white text-black hover:bg-gray-200 text-lg py-3"
              data-testid="button-submit-comment"
            >
              {submitComment.isPending ? "Submitting..." : "Submit Comment"}
            </Button>
          </form>
        </div>

        {/* Admin comments view */}
        {isLoggedIn && (
          <div className="w-full max-w-4xl mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">All Comments ({adminComments.length})</h2>
              <Button
                onClick={() => setIsLoggedIn(false)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
            
            <div className="space-y-4">
              {adminComments.length === 0 ? (
                <p className="text-white/60 text-center py-8">No comments yet.</p>
              ) : (
                adminComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white/5 border border-white/20 rounded-lg p-4 flex justify-between items-start"
                    data-testid={`comment-${comment.id}`}
                  >
                    <div className="flex-1">
                      <p className="text-white mb-2" data-testid={`text-content-${comment.id}`}>
                        {comment.content}
                      </p>
                      <p className="text-white/50 text-sm" data-testid={`text-date-${comment.id}`}>
                        {format(new Date(comment.createdAt), "PPpp")}
                      </p>
                    </div>
                    <Button
                      onClick={() => deleteComment.mutate(comment.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      data-testid={`button-delete-${comment.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}