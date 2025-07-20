/**
 * Image optimization utilities for reference sheet assets
 */

export interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  sizes: number[];
  priority: boolean;
}

export const REFERENCE_SHEET_OPTIMIZATION: ImageOptimizationConfig = {
  quality: 90,
  format: 'webp',
  sizes: [640, 828, 1200, 1920, 2048],
  priority: true,
};

export const THUMBNAIL_OPTIMIZATION: ImageOptimizationConfig = {
  quality: 80,
  format: 'webp',
  sizes: [128, 256, 384],
  priority: false,
};

/**
 * Generate responsive image sizes for Next.js Image component
 */
export function generateImageSizes(config: ImageOptimizationConfig): string {
  return config.sizes
    .map((size, index) => {
      if (index === config.sizes.length - 1) {
        return `${size}px`;
      }
      return `(max-width: ${size}px) ${size}px`;
    })
    .join(', ');
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  config: ImageOptimizationConfig = REFERENCE_SHEET_OPTIMIZATION
) {
  return {
    src,
    alt,
    quality: config.quality,
    priority: config.priority,
    sizes: generateImageSizes(config),
    style: {
      width: '100%',
      height: 'auto',
    },
  };
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = src;
    document.head.appendChild(link);
  }
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(baseSrc: string, sizes: number[]): string {
  return sizes
    .map(size => `${baseSrc}?w=${size} ${size}w`)
    .join(', ');
}