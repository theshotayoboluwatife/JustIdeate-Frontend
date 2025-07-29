import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useLocation } from "wouter";
import {
  supabase,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
  supabaseResetPassword,
} from "@/lib/supabase";
import Analytics from "@/lib/analytics";

// Mock user type that matches Supabase User interface
interface MockUser extends Partial<User> {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    bio?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getCurrentUser().then(async (user) => {
      setUser(user as MockUser);
      setIsLoading(false);

      // Skip backend profile creation in mock mode
      if (user) {
        console.log("🔐 Mock Mode: Skipping backend profile creation");
      }
    });

    // Listen for auth changes
    const { unsubscribe } = onAuthStateChange(async (authUser) => {
      setUser(authUser as MockUser);
      setIsLoading(false);

      // Mock analytics tracking
      if (authUser) {
        console.log("🔐 Mock Mode: User signed in", authUser);
        // Mock analytics - just log instead of actual tracking
        console.log("📊 Mock Analytics: User identified", {
          id: authUser.id,
          email: authUser.email,
          username: authUser.user_metadata?.username,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Mock profile creation - always succeeds
  const ensureUserProfile = async (user: any) => {
    console.log("🔐 Mock Mode: Simulating profile creation for", user.email);
    // In mock mode, we don't actually call the backend
    return Promise.resolve();
  };

  // Updated login function to accept email or username
  const login = async (emailOrUsername: string, password: string) => {
    const result = await supabaseSignIn(emailOrUsername, password);
    if (result.error) throw result.error;

    // Mock analytics tracking
    if (result.data?.user) {
      console.log("📊 Mock Analytics: Login tracked", {
        userId: result.data.user.id,
        email: result.data.user.email || emailOrUsername,
      });

      // Small delay to ensure user state is updated
      setTimeout(() => {
        window.location.href = `/profile/${result.data.user.id}`;
      }, 100);
    }

    return result.data?.user;
  };

  const register = async (userData: {
    email: string;
    password: string;
    username?: string;
    bio?: string;
  }) => {
    const { email, password, ...metadata } = userData;
    const username = metadata.username || email.split("@")[0];

    // Skip validation in mock mode - always allow registration
    console.log("🔐 Mock Mode: Skipping email/username validation");

    // Proceed with mock registration
    const result = await supabaseSignUp(email, password, {
      username,
      ...metadata,
    });
    if (result.error) throw result.error;

    // Mock profile creation - always succeeds
    if (result.data?.user) {
      console.log("🔐 Mock Mode: Simulating profile creation");
      console.log("📊 Mock Analytics: Signup tracked", {
        userId: result.data.user.id,
        email: result.data.user.email || email,
      });

      // Redirect to profile page after successful registration
      setTimeout(() => {
        window.location.href = `/profile/${result.data.user.id}`;
      }, 100);
    }

    return result.data?.user;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabaseResetPassword(email);
    if (error) throw error;
    console.log("🔐 Mock Mode: Password reset requested for", email);
  };

  const logout = async () => {
    // Mock analytics tracking
    if (user) {
      console.log("📊 Mock Analytics: Logout tracked", { userId: user.id });
    }

    await supabaseSignOut();
    setUser(null);

    // Mock analytics reset
    console.log("📊 Mock Analytics: User session reset");
  };

  return {
    user: user as User | null,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
  };
}