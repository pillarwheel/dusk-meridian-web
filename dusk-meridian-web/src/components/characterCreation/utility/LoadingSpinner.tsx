import React from 'react';
import { Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  submessage?: string;
  type?: 'loading' | 'success' | 'error' | 'warning';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  submessage,
  type = 'loading',
  className
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'loading': return Loader2;
      case 'success': return CheckCircle2;
      case 'error': return AlertCircle;
      case 'warning': return Clock;
      default: return Loader2;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'loading': return 'text-primary';
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-primary';
    }
  };

  const Icon = getIcon();

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      <Icon
        className={cn(
          getSizeClasses(),
          getColor(),
          type === 'loading' && 'animate-spin'
        )}
      />

      {message && (
        <div className="text-center">
          <p className={cn(
            'font-medium',
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          )}>
            {message}
          </p>

          {submessage && (
            <p className={cn(
              'text-muted-foreground mt-1',
              size === 'sm' ? 'text-xs' : 'text-sm'
            )}>
              {submessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  submessage?: string;
  type?: 'loading' | 'success' | 'error' | 'warning';
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message,
  submessage,
  type = 'loading',
  children
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-8 min-w-80 text-center shadow-2xl">
        <LoadingSpinner
          size="lg"
          message={message}
          submessage={submessage}
          type={type}
        />
        {children}
      </div>
    </div>
  );
};

interface ProgressIndicatorProps {
  steps: Array<{ id: string; title: string; completed: boolean; current: boolean }>;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all',
                step.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.current
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-background border-border text-muted-foreground'
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={cn(
              'text-xs mt-2 text-center max-w-20 line-clamp-2',
              step.current ? 'text-primary font-medium' : 'text-muted-foreground'
            )}>
              {step.title}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2 transition-all',
                step.completed ? 'bg-green-500' : 'bg-border'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};