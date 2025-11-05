import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import logoUrl from "@assets/Generated Image October 15, 2025 - 2_50PM_1760558692104.png";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('No verification token found in URL');
          return;
        }

        // Call verification API
        const res = await apiRequest('POST', '/api/auth/verify-email', { token });
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          // Redirect to login after 3 seconds
          setTimeout(() => setLocation('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification');
      }
    };

    verifyEmail();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoUrl} alt="ABCapture Logo" className="w-24 h-auto mb-4" />
          </div>
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Your Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address.'}
            {status === 'success' && 'Your email has been successfully verified.'}
            {status === 'error' && 'We couldn\'t verify your email address.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-4 rounded-lg ${
              status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
              status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 
              'bg-gray-50 text-gray-800'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setLocation('/login')}
              >
                Go to Login
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => setLocation('/signup')}
              >
                Back to Sign Up
              </Button>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  The verification link may have expired or is invalid.
                </p>
                <p className="text-xs text-muted-foreground">
                  Please try signing up again or contact support.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}