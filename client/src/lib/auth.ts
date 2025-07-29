import { User } from "@shared/schema";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<User>;
  register: (userData: {
    email: string;
    username: string;
    bio?: string;
    profileImage?: string;
  }) => Promise<User>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<User>;
}

// This would typically be a context provider in a larger app
export const AUTH_STORAGE_KEY = "just-ideate-user";

export function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
