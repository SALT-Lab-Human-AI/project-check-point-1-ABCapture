import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import logoUrl from "../../../attached_assets/ABCapture logo.png";
import { CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    if (!tokenParam) {
      toast({
        title: "Invalid link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/login"), 3000);
    } else {
      setToken(tokenParam);
    }
  }, [toast, setLocation]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/auth/reset-password", { 
        token, 
        newPassword 
      });
      
      setIsSuccess(true);
      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password.",
      });
      
      setTimeout(() => setLocation("/login"), 3000);
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset password. The link may have expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login" className="text-primary hover:underline">
              Return to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been reset. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login" className="text-primary hover:underline">
              Click here if not redirected
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="ABCapture Logo" className="w-32 h-auto" />
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}