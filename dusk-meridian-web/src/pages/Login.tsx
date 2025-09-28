import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Shield, Zap, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { ROUTES } from '@/utils/constants';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useIMXAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginMethod, setLoginMethod] = React.useState<'passport' | 'traditional'>('passport');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, navigate]);

  const handleIMXLogin = async () => {
    try {
      await login();
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('IMX login error:', error);
    }
  };

  const handleTraditionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle traditional login logic here (placeholder)
    console.log('Traditional login attempt:', { email, password });
    // This would integrate with your existing auth system
  };

  return (
    <div className="min-h-screen flex items-center justify-center dusk-gradient">
      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 dusk-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">DM</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your Dusk Meridian account</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Login Method Toggle */}
          <div className="flex bg-background rounded-lg p-1">
            <button
              onClick={() => setLoginMethod('passport')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'passport'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Passport
            </button>
            <button
              onClick={() => setLoginMethod('traditional')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'traditional'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Traditional
            </button>
          </div>

          {loginMethod === 'passport' ? (
            <div className="space-y-4">
              {/* IMX Passport Login */}
              <button
                onClick={handleIMXLogin}
                disabled={isLoading}
                className="w-full game-button flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                <span>
                  {isLoading ? 'Connecting...' : 'Connect with Immutable Passport'}
                </span>
              </button>

              {/* Passport Benefits */}
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-medium text-foreground">Passport Benefits:</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span>Secure wallet integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span>Gasless transactions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-3 h-3 text-purple-400" />
                    <span>NFT & cryptocurrency support</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTraditionalSubmit} className="space-y-4">
              {/* Traditional Login Form */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" className="w-full game-button">
                Sign In
              </button>

              <div className="text-center">
                <Link
                  to="#"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          )}

          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};