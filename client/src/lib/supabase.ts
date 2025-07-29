import { createClient } from "@supabase/supabase-js";

// Mock user data
const MOCK_USER = {
  id: "mock-user-123",
  email: "demo@example.com",
  user_metadata: {
    username: "demouser",
    bio: "This is a demo account for testing"
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Create Supabase client with placeholders
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Mock authentication state
let isAuthenticated = false;
let authStateListeners: ((user: any) => void)[] = [];

// Helper to notify auth state changes
const notifyAuthStateChange = (user: any) => {
  authStateListeners.forEach(callback => callback(user));
};

// Helper function to check if input is email or username
const isEmail = (input: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

// Mock implementation - always returns mock email
const getEmailFromUsername = async (username: string): Promise<string | null> => {
  // In mock mode, just return the demo email
  return MOCK_USER.email;
};

// Mock signIn - always succeeds
export const signIn = async (emailOrUsername: string, password: string) => {
  console.log("🔐 Mock authentication - signing in...");
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  isAuthenticated = true;
  notifyAuthStateChange(MOCK_USER);
  
  return {
    data: {
      user: MOCK_USER,
      session: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        user: MOCK_USER
      }
    },
    error: null
  };
};

// Mock signUp - always succeeds
export const signUp = async (
  email: string,
  password: string,
  userData: { username: string; bio?: string },
) => {
  console.log("🔐 Mock authentication - signing up...");
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Create a new mock user with provided data
  const newMockUser = {
    ...MOCK_USER,
    id: `mock-user-${Date.now()}`,
    email,
    user_metadata: {
      ...userData
    }
  };
  
  isAuthenticated = true;
  notifyAuthStateChange(newMockUser);
  
  return {
    data: {
      user: newMockUser,
      session: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        user: newMockUser
      }
    },
    error: null
  };
};

// Mock signOut
export const signOut = async () => {
  console.log("🔐 Mock authentication - signing out...");
  
  isAuthenticated = false;
  notifyAuthStateChange(null);
};

// Mock password reset
export const supabaseResetPassword = async (emailOrUsername: string) => {
  console.log("🔐 Mock authentication - password reset requested");
  
  return {
    data: {},
    error: null
  };
};

// Mock getCurrentUser
export const getCurrentUser = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return isAuthenticated ? MOCK_USER : null;
};

// Mock onAuthStateChange
export const onAuthStateChange = (callback: (user: any) => void) => {
  // Add the callback to our listeners
  authStateListeners.push(callback);
  
  // Immediately call with current state
  callback(isAuthenticated ? MOCK_USER : null);
  
  // Return unsubscribe function
  return {
    data: { subscription: { unsubscribe: () => {
      authStateListeners = authStateListeners.filter(cb => cb !== callback);
    }}},
    error: null,
    unsubscribe: () => {
      authStateListeners = authStateListeners.filter(cb => cb !== callback);
    }
  };
};