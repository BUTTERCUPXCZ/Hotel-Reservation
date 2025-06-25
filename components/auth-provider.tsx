"use client";

import { useEffect, createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

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
  // Check if user is authenticated on mount
  useEffect(() => {
    // Get user from localStorage and check cookies
    const checkAuth = () => {
      try {
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
            }
            if (!document.cookie.includes('userEmail=')) {
              document.cookie = `userEmail=${parsedUser.email}${cookieOptions}`;
            }
            if (parsedUser.name && !document.cookie.includes('userName=')) {
              document.cookie = `userName=${parsedUser.name}${cookieOptions}`;
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
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
