"use client";

import { useEffect, createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggingOut } from "@/lib/trpc-helpers";

// Define the auth context type
interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

// Auth provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Custom hook to use auth context
export function useAuthContext() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount and listen for storage changes
  useEffect(() => {
    // Get user from localStorage and check cookies
    const checkAuth = () => {
      try {
        // Don't try to restore auth if we're in the process of logging out
        if (isLoggingOut()) {
          console.log("Skipping auth check during logout");
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Check localStorage first
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);

          // Check if login time is still valid (24 hours)
          const loginTime = parsedUser.loginTime || 0;
          const isExpired = Date.now() - loginTime > 24 * 60 * 60 * 1000;

          if (isExpired) {
            console.log("Session expired, clearing auth data");
            localStorage.removeItem('user');
            // Clear cookies
            document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            setUser(null);
          } else {
            setUser(parsedUser);

            // Ensure cookies are set (they might be missing if localStorage exists but cookies expired)
            const cookieOptions = "; path=/; max-age=86400; SameSite=Lax";

            // Check if cookies exist, set them if not
            if (!document.cookie.includes('userId=')) {
              document.cookie = `userId=${parsedUser.id}${cookieOptions}`;
              console.log("AuthProvider - Set userId cookie");
            }
            if (!document.cookie.includes('userEmail=')) {
              document.cookie = `userEmail=${parsedUser.email}${cookieOptions}`;
              console.log("AuthProvider - Set userEmail cookie");
            }
            if (parsedUser.name && !document.cookie.includes('userName=')) {
              document.cookie = `userName=${encodeURIComponent(parsedUser.name)}${cookieOptions}`;
              console.log("AuthProvider - Set userName cookie");
            }
          }
        } else {
          // No user in localStorage, check cookies
          const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return undefined;
          };

          const userId = getCookie('userId');
          const userEmail = getCookie('userEmail');

          // If cookies exist but no localStorage, reconstruct user
          if (userId && userEmail) {
            const userName = getCookie('userName');
            const reconstructedUser = {
              id: userId,
              email: userEmail,
              name: userName,
              loginTime: Date.now() // Reset login time
            };

            localStorage.setItem('user', JSON.stringify(reconstructedUser));
            setUser(reconstructedUser);
            console.log("Reconstructed user from cookies");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        console.log("Storage change detected for user key");
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events (for same-tab login updates)
    const handleAuthChange = () => {
      console.log("Auth change event detected");
      checkAuth();
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    // Force check auth on router changes to ensure synchronization
    const handleRouteChange = () => {
      // This helps ensure auth state is consistent when navigating
      setTimeout(checkAuth, 50);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
