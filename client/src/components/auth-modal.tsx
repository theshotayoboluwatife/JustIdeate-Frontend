import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(emailOrUsername, password);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
      } else {
        if (!username.trim()) {
          toast({
            variant: "destructive",
            title: "Username required",
            description: "Please enter a username.",
          });
          setIsLoading(false);
          return;
        }
        await register({ email, password, username, bio: bio || undefined });
        toast({
          title: "Success",
          description:
            "Account created successfully! Please check your email to verify your account.",
        });
      }
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: isLogin ? "Login failed" : "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmailOrUsername("");
    setEmail("");
    setPassword("");
    setUsername("");
    setBio("");
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-raleway font-bold">
            {isLogin ? "Sign In" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">Email or Username</Label>
              <Input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter your email or username"
                required
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-[#2b3012] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Input
                  id="bio"
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2b3012] hover:bg-[#364636] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-[#2b3012] hover:underline"
              disabled={isLoading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </DialogContent>
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setResetLoading(true); // Start loading
              try {
                await resetPassword(resetIdentifier);
                toast({
                  title: "Check your inbox",
                  description:
                    "If that email's in our system, a reset link is on the way! It may take a few minutes to show up in your inbox.",
                });
                setShowForgotPassword(false);
                setResetIdentifier("");
              } catch (err: any) {
                toast({
                  variant: "destructive",
                  title: "Reset failed",
                  description: err.message || "Something went wrong.",
                });
              } finally {
                setResetLoading(false); // Stop loading
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="resetIdentifier">Email or Username</Label>
              <Input
                id="resetIdentifier"
                type="text"
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                placeholder="Enter your email or username"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#2b3012] text-white"
              disabled={resetLoading}
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
