// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { trpc } from './trpc';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  const { mutateAsync: loginMutation } = trpc.auth.login.useMutation();
  const { mutateAsync: registerMutation } = trpc.auth.register.useMutation();
  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Skip API call and use localStorage directly
      // This avoids the JSON parsing error since we don't have a proper /api/auth/session endpoint yet
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Failed to parse user data from localStorage:', e);
          localStorage.removeItem('user');
        }
      }

      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);
  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('Login function called with:', { email });
      setIsLoading(true);

      console.log('Calling loginMutation...');
      const result = await loginMutation({ email, password });
      console.log('Login mutation result:', result);

      if (result.status === 'success') {
        console.log('Login successful, saving user to localStorage');
        // Save user in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        setIsAuthenticated(true);
        console.log('Auth state updated:', { user: result.user, isAuthenticated: true });
        return { success: true };
      }

      console.log('Login failed, status not success:', result);
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      // Get more detailed error information
      const errorMessage = error.message ||
        (error.data && error.data.message) ||
        (error.shape && error.shape.message) ||
        'Login failed';

      console.error('Login error details:', {
        message: errorMessage,
        code: error.code,
        data: error.data,
        shape: error.shape
      });

      return {
        success: false,
        error: errorMessage
      };
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
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };
  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout
  };
}

// Only export as named export to avoid import confusion
// export default useAuth;
