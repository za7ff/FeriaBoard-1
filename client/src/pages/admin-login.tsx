import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('adminLoggedIn', 'true');
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard!",
        });
        // Small delay to ensure localStorage is set
        setTimeout(() => {
          setLocation('/admin');
        }, 100);
      }
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    login.mutate({ username, password });
  };

  return (
    <div className="min-h-screen animated-bg relative flex items-center justify-center">
      <div className="floating-particles"></div>
      
      {/* Home button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="text-white/70 hover:text-white transition-colors">
          <Home size={24} />
        </Link>
      </div>

      {/* Login form */}
      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="bg-black/80 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/10 rounded-full">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Login</CardTitle>
            <p className="text-white/70 text-sm">
              Enter your credentials to access the admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-white/10 border-white/30 text-white placeholder-white/50 focus:border-white/50"
                  data-testid="input-username"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-white/10 border-white/30 text-white placeholder-white/50 focus:border-white/50"
                  data-testid="input-password"
                />
              </div>

              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-2"
                data-testid="button-login"
              >
                {login.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-xs text-white/50 text-center">
                Demo credentials: admin / secret123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}