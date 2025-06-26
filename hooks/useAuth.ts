// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { trpc } from './trpc';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth-provider';
import { useQueryClient } from '@tanstack/react-query';
import { isLoggingOut, cancelAllQueries, clearTRPCCache, setLoggingOutFlag, clearLoggingOutFlag } from '@/lib/trpc-helpers';

export function useAuth() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Get access to the React Query client used by TRPC
  const queryClient = useQueryClient();

  const router = useRouter();

  // Check for logout flag on mount and cancel queries if needed
  useEffect(() => {
    if (isLoggingOut()) {
      cancelAllQueries(queryClient);
    }
  }, [queryClient]);

  const { mutateAsync: loginMutation } = trpc.auth.login.useMutation();
  const { mutateAsync: registerMutation } = trpc.auth.register.useMutation();

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Starting login process for:", email);

      console.log("Creating login mutation promise...");
      const result = await loginMutation({ email, password });

      console.log("Raw login result:", result);

      if (result?.status === 'success' && result?.user) {
        console.log("Login successful, processing user data...");

        // Save user in localStorage with timestamp
        const userData = {
          ...result.user,
          loginTime: Date.now() // Add timestamp for potential session expiry
        };

        // Set the authentication cookies - using Secure and SameSite for better security
        const cookieOptions = "; path=/; max-age=86400; SameSite=Lax";

        console.log("Setting authentication cookies...");
        document.cookie = `userId=${result.user.id}${cookieOptions}`;
        document.cookie = `userEmail=${result.user.email}${cookieOptions}`;
        if (result.user.name) {
          document.cookie = `userName=${encodeURIComponent(result.user.name)}${cookieOptions}`;
        }

        // Verify cookies were set
        setTimeout(() => {
          const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return undefined;
          };

          console.log("Verification - cookies after setting:", {
            userId: getCookie('userId'),
            userEmail: getCookie('userEmail'),
            userName: getCookie('userName')
          });
        }, 100);

        console.log("Authentication cookies set:",
          `userId=${result.user.id}`,
          `userEmail=${result.user.email}`,
          result.user.name ? `userName=${result.user.name}` : "No username"
        );

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        console.log("User data saved to localStorage");

        // Trigger auth state change event for same-tab updates
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        console.log("Login successful, auth state will be updated");

        return { success: true };
      } else {
        console.warn("Login response missing expected data:", result);
        return { success: false, error: 'Invalid login response format' };
      }
    } catch (error: any) {
      console.error("Login error caught:", error);

      // Detailed error logging
      if (error.shape) {
        console.error("TRPC error shape:", error.shape);
        if (error.shape.data) {
          console.error("TRPC error data:", error.shape.data);
        }
      }

      if (error.cause) {
        console.error("Error cause:", error.cause);
      }

      if (error.stack) {
        console.error("Error stack:", error.stack);
      }

      // Simplified error handling with more specific messages
      let errorMessage = 'Login failed';

      if (error.message?.includes('timeout')) {
        errorMessage = 'Login request timed out. Please check your internet connection and try again.';
      } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('connection')) {
        errorMessage = 'Unable to connect to server. Please try again later.';
      } else if (error.message?.includes('reach database') || error.message?.includes('P1001')) {
        errorMessage = 'Database connection failed. Please try again later or contact support.';
      } else if (error.message?.includes('Cannot connect to database server')) {
        errorMessage = 'Service temporarily unavailable. Please try again in a few moments.';
      } else if (error.message?.includes('Database connection timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message?.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.shape?.message) {
        errorMessage = error.shape.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log("Final error message to display:", errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      console.log("Starting registration process...");
      const result = await registerMutation(userData);
      console.log("Registration result:", result);

      if (result.status === 'success') {
        // Return success but don't auto-login
        return { success: true, message: 'Registration successful!' };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error("Registration error:", error);
      // Extract error message from TRPC error or use fallback
      const errorMessage = error.message ||
        error.data?.message ||
        error.shape?.message ||
        'Registration failed';

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Ensure the logging out flag is set
      setLoggingOutFlag();

      // Cancel all active TRPC queries to prevent "unauthorized" errors
      cancelAllQueries(queryClient);

      // Clear the TRPC cache
      clearTRPCCache(queryClient);

      // Remove user data from localStorage
      localStorage.removeItem('user');

      // Clear cookies
      document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      console.log("Logout completed - auth cookies and localStorage cleared");

      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('authStateChanged'));

      // Navigate to login - wrapped in setTimeout to ensure cookie clearing happens first
      setTimeout(() => {
        router.push('/login');

        // Remove the logging out flag after navigation
        setTimeout(() => {
          clearLoggingOutFlag();
        }, 200);
      }, 50);
    } catch (error) {
      console.error("Error during logout:", error);
      // Fallback redirect even if there was an error
      clearLoggingOutFlag();
      router.push('/login');
    }
  };

  return {
    user,
    isLoading: isLoading || authLoading,
    isAuthenticated,
    login,
    register,
    logout
  };
}

// Only export as named export to avoid import confusion
// export default useAuth;
