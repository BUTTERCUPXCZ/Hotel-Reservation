// app/login/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const registeredParam = searchParams.get("registered");
  const emailParam = searchParams.get("email");

  // Set email from URL parameter if available
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    if (registeredParam === "true") {
      setSuccessMessage("Account created successfully! Please log in.");
    }
  }, [emailParam, registeredParam]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);
    console.log("Login form submitted with:", { email, password: "***" });

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    try {
      console.log("Calling login function...");
      const result = await login(email, password);
      console.log("Login result:", result);

      if (result.success) {
        console.log("Login successful, redirecting to:", redirectUrl);
        setSuccessMessage("Login successful! Redirecting...");
        // Add a small delay to show success message before redirect
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      } else {
        console.error("Login failed:", result.error);
        let errorMessage = result.error || "Login failed";

        // Provide more user-friendly error messages
        if (errorMessage.includes("Database connection") || errorMessage.includes("Tenant or user not found")) {
          errorMessage = "Our service is temporarily unavailable. Please try again later or contact support if the problem persists.";
        } else if (errorMessage.includes("timeout")) {
          errorMessage = "Login request timed out. Please check your internet connection and try again.";
        } else if (errorMessage.includes("ECONNREFUSED")) {
          errorMessage = "Service temporarily unavailable. Please try again in a few minutes.";
        } else if (errorMessage.includes("Invalid email or password") ||
          errorMessage.includes("Invalid credentials") ||
          errorMessage.includes("Authentication failed") ||
          errorMessage.includes("User not found") ||
          errorMessage.includes("Incorrect password")) {
          // Enhanced error message for invalid credentials
          setErrors({
            submit: "The email or password you entered is incorrect. Please check your credentials and try again.",
            email: "Please verify your email address",
            password: "Please verify your password"
          });
          return;
        } else if (errorMessage.includes("Cannot connect to database server")) {
          errorMessage = "Database service is currently unavailable. Please try again in a few moments.";
        } else if (errorMessage.includes("Service temporarily unavailable")) {
          errorMessage = "Service temporarily unavailable. Please try again in a few moments.";
        } else {
          // Generic invalid credentials message for any unhandled authentication errors
          errorMessage = "The email or password you entered is incorrect. Please check your credentials and try again.";
        }

        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md" style={{ backgroundColor: '#FAFAFA', borderColor: '#E0E0E0' }}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">K</span>
            </div>
            <span className="text-xl font-bold">Kayan</span>
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 text-center p-2 bg-green-50 text-green-600 rounded-md text-sm">
              {successMessage}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>

            {errors.submit && (
              <div className="text-center p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                <div className="flex items-center justify-center space-x-2">

                  <span className="font-medium">{errors.submit}</span>
                </div>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}