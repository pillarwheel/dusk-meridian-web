import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, LogOut } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

export const Logout: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'complete'>('loading');

  useEffect(() => {
    handleLogoutRedirect();
  }, []);

  const handleLogoutRedirect = async () => {
    try {
      setStatus('loading');

      // Wait a moment for the logout to complete
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus('complete');

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2000);

    } catch (error) {
      console.error('Logout redirect error:', error);
      // Still redirect to login even if there's an error
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1000);
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
            {status === 'loading' ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500" />
            )}
          </div>

          {/* Status Message */}
          <h1 className="text-xl font-semibold mb-2 flex items-center justify-center">
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </h1>
          <p className="text-sm text-muted-foreground">
            {status === 'loading'
              ? 'Signing you out securely...'
              : 'You have been logged out successfully.'
            }
          </p>

          {/* Loading dots */}
          {status === 'loading' && (
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
            </div>
          )}

          {/* Complete Actions */}
          {status === 'complete' && (
            <div className="mt-6">
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign In Again
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Thank you for playing Dusk Meridian
          </p>
        </div>
      </div>
    </div>
  );
};