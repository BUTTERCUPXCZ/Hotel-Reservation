// hooks/useAuth.ts
'use client';

import { useState } from 'react';
import { trpc } from './trpc';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth-provider';

export function useAuth() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const { mutateAsync: loginMutation } = trpc.auth.login.useMutation();
  const { mutateAsync: registerMutation } = trpc.auth.register.useMutation();  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Set a timeout for the login request to prevent hanging
      const loginPromise = loginMutation({ email, password });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login request timed out')), 5000)
      );

      // Race the login request against the timeout
      const result = await Promise.race([loginPromise, timeoutPromise]) as any;

      console.log("Login result:", result);

      if (result?.status === 'success' && result?.user) {
        // Save user in localStorage with timestamp
        const userData = {
          ...result.user,
          loginTime: Date.now() // Add timestamp for potential session expiry
        };

        // Set the authentication cookies - using Secure and SameSite for better security
        const cookieOptions = "; path=/; max-age=86400; SameSite=Lax";
        document.cookie = `userId=${result.user.id}${cookieOptions}`;
        document.cookie = `userEmail=${result.user.email}${cookieOptions}`;
        if (result.user.name) {
          document.cookie = `userName=${result.user.name}${cookieOptions}`;
        }

        console.log("Setting cookies:",
          `userId=${result.user.id}`,
          `userEmail=${result.user.email}`,
          result.user.name ? `userName=${result.user.name}` : "No username"
        );

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        console.log("User data saved to localStorage");

        // Reload the page to refresh the auth state everywhere
        window.location.reload();

        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error("Login error:", error);

      // Detailed error logging
      if (error.shape) {
        console.error("TRPC error shape:", error.shape);
      }

      // Simplified error handling
      const errorMessage =
        error.message ||
        (error.shape?.message) ||
        'Login failed';

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
    // Remove from localStorage
    localStorage.removeItem('user');

    // Clear cookies
    document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    // Reload to refresh auth state
    router.push('/login');
    window.location.reload();
  }; return {
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
