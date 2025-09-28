import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { ROUTES } from '@/utils/constants';

export const Redirect: React.FC = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useIMXAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    handleAuthRedirect();
  }, []);

  const handleAuthRedirect = async () => {
    try {
      setStatus('loading');
      setMessage('Processing authentication...');

      // Import the passport service to call loginCallback
      const { imxPassportService } = await import('@/services/imxPassport');

      // Call loginCallback to process the authentication tokens from URL
      await imxPassportService.loginCallback();

      // Refresh the auth state to pick up the new tokens
      await refreshAuth();

      setStatus('success');
      setMessage('Authentication successful! Redirecting...');

      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate(ROUTES.HOME);
      }, 2000);

    } catch (error) {
      console.error('Authentication redirect error:', error);
      setStatus('error');
      setMessage('Authentication failed. Please try again.');

      // Redirect to login page after error
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-primary';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto dusk-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DM</span>
            </div>
          </div>

          {/* Status Icon */}
          <div className="mb-4 flex justify-center">
            {getStatusIcon()}
          </div>

          {/* Status Message */}
          <h1 className="text-xl font-semibold mb-2">Authentication</h1>
          <p className={`text-sm ${getStatusColor()}`}>
            {message}
          </p>

          {/* Loading dots */}
          {status === 'loading' && (
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
            </div>
          )}

          {/* Error Actions */}
          {status === 'error' && (
            <div className="mt-6 space-y-2">
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Return to Login
              </button>
              <button
                onClick={handleAuthRedirect}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Immutable Passport
          </p>
        </div>
      </div>
    </div>
  );
};