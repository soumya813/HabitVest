"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name?: string;
  username?: string;
  email: string;
  notifications?: {
    habitReminders?: boolean;
    achievementAlerts?: boolean;
    weeklySummary?: boolean;
  };
  // legacy "points" kept for compatibility with older UI code
  points?: number;
  // New XP/level fields
  xp?: number;
  level?: number;
  xpToNext?: number;
  totalXp?: number;
  totalTasksCompleted?: number;
  totalRewardsRedeemed?: number;
  createdAt?: string;
  // Onboarding fields
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
  goals?: string[];
  schedule?: {
    wakeUpTime?: string;
    workoutTime?: string;
    studyTime?: string;
    bedTime?: string;
    reminderPreferences?: {
      morning?: boolean;
      evening?: boolean;
      beforeDeadlines?: boolean;
    };
  };
  preferences?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    focusAreas?: string[];
    motivationStyle?: 'competitive' | 'collaborative' | 'personal';
  };
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserPoints: (points: number) => void;
  // convenience alias for XP-aware code
  setUserXp?: (xp: number) => void;
  debug?: any; // For debugging purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const setUserPoints = (points: number) => {
  // Keep legacy points field in sync, but also set xp for the new XP-based UI
  setUser(prev => prev ? { ...prev, points, xp: points } : prev);
  };
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if we're running in the browser
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Validate user session with backend on mount
    const validateSession = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/v1/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
          headers: { 'Content-Type': 'application/json' },
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.data) {
            setUser(data.data);
            setToken('authenticated'); // We don't need the actual token on frontend
            console.log('Session validated, user:', data.data);
          } else {
            // Session invalid
            setUser(null);
            setToken(null);
          }
        } else {
          const text = await res.text();
          console.error('Session validation failed:', res.status, text);
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Server returned non-JSON response - backend may be down');
          }
          // Session invalid
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = (newToken: string, newUser: User) => {
    console.log('Login called with:');
    console.log('Token:', newToken);
    console.log('User:', newUser);
    
    // Validate inputs
    if (!newUser || !newUser._id) {
      console.error('Invalid user data provided to login');
      return;
    }
    
    // Set user and token state (token is already set as HTTP-only cookie by backend)
    setToken('authenticated'); // We don't store the actual token on frontend
    setUser(newUser);
    router.push('/');
  };

  const clearAuthData = () => {
    setToken(null);
    setUser(null);
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear HTTP-only cookie
      await fetch('http://localhost:5001/api/v1/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      clearAuthData();
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/v1/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
          console.log('User data refreshed:', data.data);
        }
      } else {
        const text = await res.text();
        console.error('Failed to refresh user data:', res.status, text);
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response - backend may be down');
        }
      }
    } catch (e) {
      console.error("Error refreshing user data:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      isLoading, 
      login, 
      logout,
      refreshUser,
      setUserPoints,
      setUserXp: (xp: number) => setUser(prev => prev ? { ...prev, xp } : prev),
      debug: { hasToken: !!token, hasUser: !!user, userKeys: user ? Object.keys(user) : [] }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};