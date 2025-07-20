'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ImageDimensions } from '@/types';

export interface RefSheetImageProps {
  src: string;
  alt: string;
  onImageLoad: (dimensions: ImageDimensions) => void;
  className?: string;
}

export interface RefSheetImageState {
  isLoading: boolean;
  hasError: boolean;
  dimensions: ImageDimensions | null;
}

export const RefSheetImage: React.FC<RefSheetImageProps> = ({
  src,
  alt,
  onImageLoad,
  className = ''
}) => {
  const [state, setState] = useState<RefSheetImageState>({
    isLoading: true,
    hasError: false,
    dimensions: null
  });
  
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const dimensions: ImageDimensions = {
      width: img.naturalWidth,
      height: img.naturalHeight
    };

    setState({
      isLoading: false,
      hasError: false,
      dimensions
    });

    onImageLoad(dimensions);
  }, [onImageLoad]);

  const handleImageError = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true
    }));
  }, []);

  const handleRetry = useCallback(() => {
    setState({
      isLoading: true,
      hasError: false,
      dimensions: null
    });
  }, []);

  // Reset state when src changes
  useEffect(() => {
    setState({
      isLoading: true,
      hasError: false,
      dimensions: null
    });
  }, [src]);

  if (state.hasError) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl text-gray-400 mb-4">🖼️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Failed to load reference sheet
          </h3>
          <p className="text-gray-500 mb-4 max-w-md">
            The character reference sheet could not be loaded. Please check your internet connection and try again.
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Retry loading image"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reference sheet...</p>
          </div>
        </div>
      )}
      
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        width={0}
        height={0}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        className={`w-full h-auto max-w-full object-contain transition-opacity duration-300 ${
          state.isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        priority
        quality={90}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        style={{
          aspectRatio: state.dimensions 
            ? `${state.dimensions.width} / ${state.dimensions.height}` 
            : 'auto'
        }}
      />
    </div>
  );
};

export default RefSheetImage;