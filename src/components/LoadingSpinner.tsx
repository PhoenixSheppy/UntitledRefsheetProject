'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

/**
 * Loading spinner component with optional message
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  message
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 ${sizeClasses[size]}`} />
      {message && (
        <p className="text-sm text-neutral-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

/**
 * Full-screen loading overlay
 */
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
};

/**
 * Card-based loading state
 */
export const LoadingCard: React.FC<{ message?: string; className?: string }> = ({ 
  message = 'Loading reference sheet...', 
  className = '' 
}) => {
  return (
    <div className={`card p-8 text-center ${className}`}>
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
};

export default LoadingSpinner;