'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { RefSheetConfig } from '@/types';
import { validateRefSheetConfig } from '@/utils/config';
import { RefSheetContainer } from './RefSheetContainer';
import { PageHeader, Card } from './Layout';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingCard } from './LoadingSpinner';

interface RefSheetPageProps {
  config: RefSheetConfig;
  className?: string;
}

/**
 * Main page component that integrates all RefSheet features
 * Includes error boundaries, loading states, and responsive layout
 */
export const RefSheetPage: React.FC<RefSheetPageProps> = ({
  config,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [validatedConfig, setValidatedConfig] = useState<RefSheetConfig | null>(null);

  // Validate configuration on mount
  useEffect(() => {
    const validateConfig = async () => {
      try {
        setIsLoading(true);
        setConfigError(null);

        // Validate the configuration
        const validation = validateRefSheetConfig(config);
        if (!validation.isValid) {
          throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
        }

        // Check if image exists (basic check)
        if (config.image.src && !config.image.src.startsWith('data:')) {
          try {
            const response = await fetch(config.image.src, { method: 'HEAD' });
            if (!response.ok) {
              console.warn(`Image may not be accessible: ${config.image.src}`);
            }
          } catch (error) {
            console.warn(`Could not verify image accessibility: ${config.image.src}`, error);
          }
        }

        setValidatedConfig(config);
      } catch (error) {
        console.error('Configuration validation error:', error);
        setConfigError(error instanceof Error ? error.message : 'Unknown configuration error');
      } finally {
        setIsLoading(false);
      }
    };

    validateConfig();
  }, [config]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <PageHeader
          title="Interactive Character Reference Sheet"
          description="Loading your character design..."
        />
        <LoadingCard message="Preparing reference sheet..." />
      </div>
    );
  }

  // Configuration error state
  if (configError || !validatedConfig) {
    return (
      <div className={`space-y-8 ${className}`}>
        <PageHeader
          title="Interactive Character Reference Sheet"
          description="There was an issue loading the reference sheet"
        />
        <Card className="border-red-200 bg-red-50 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800">
            Configuration Error
          </h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">
            {configError || 'Invalid reference sheet configuration'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header Section */}
      <PageHeader
        title="Interactive Character Reference Sheet"
        description="Explore the character design by hovering over different areas to discover the color palette used in the artwork."
      />

      {/* Main Reference Sheet Section */}
      <ErrorBoundary
        fallback={
          <Card className="border-red-200 bg-red-50 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800">
              Reference Sheet Error
            </h3>
            <p className="text-sm text-red-600 max-w-md mx-auto">
              There was an error loading the interactive reference sheet. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </Card>
        }
        onError={(error, errorInfo) => {
          console.error('RefSheetPage Error:', error, errorInfo);
        }}
      >
        <section className="flex justify-center">
          <Suspense fallback={<LoadingCard message="Loading reference sheet..." />}>
            <RefSheetContainer
              imageUrl={validatedConfig.image.src}
              imageAlt={validatedConfig.image.alt}
              colorSegments={validatedConfig.colorSegments}
              preferredPanelSide={validatedConfig.layout.preferredPanelSide}
              className="w-full"
            />
          </Suspense>
        </section>
      </ErrorBoundary>

      {/* Instructions Section */}
      <section className="text-center space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-800">
          How to Use
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="space-y-3 text-center">
            <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">1</span>
            </div>
            <h3 className="font-medium text-neutral-800">Hover to Explore</h3>
            <p className="text-sm text-neutral-600">
              Move your cursor over different areas of the character to discover interactive color segments.
            </p>
          </Card>
          
          <Card className="space-y-3 text-center">
            <div className="w-12 h-12 mx-auto bg-accent-100 rounded-full flex items-center justify-center">
              <span className="text-accent-600 font-bold text-lg">2</span>
            </div>
            <h3 className="font-medium text-neutral-800">View Color Details</h3>
            <p className="text-sm text-neutral-600">
              See detailed color information including hex codes, RGB, and HSL values in the popup panel.
            </p>
          </Card>
          
          <Card className="space-y-3 text-center">
            <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">3</span>
            </div>
            <h3 className="font-medium text-neutral-800">Mobile Friendly</h3>
            <p className="text-sm text-neutral-600">
              On touch devices, tap the color segments to view the color information panel.
            </p>
          </Card>
        </div>
      </section>

      {/* Color Segments Summary (if segments exist) */}
      {validatedConfig.colorSegments.length > 0 && (
        <section className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-neutral-800">
            Color Palette ({validatedConfig.colorSegments.length} colors)
          </h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {validatedConfig.colorSegments.map((segment) => (
              <div
                key={segment.id}
                className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 shadow-sm border"
                title={`${segment.name}: ${segment.colorInfo.hex}`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-neutral-300"
                  style={{ backgroundColor: segment.colorInfo.hex }}
                />
                <span className="text-xs font-medium text-neutral-700">
                  {segment.name}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {segment.colorInfo.hex}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RefSheetPage;