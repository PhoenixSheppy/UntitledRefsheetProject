/**
 * Image optimization utilities for production deployment
 */

export interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  sizes: string;
  priority: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Get optimized image configuration for reference sheets
 */
export function getRefSheetImageConfig(): ImageOptimizationConfig {
  return {
    quality: 85,
    format: 'webp',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
    priority: true,
    placeholder: 'blur',
    blurDataURL: generateBlurDataURL(),
  };
}

/**
 * Generate a blur data URL for image placeholders
 */
function generateBlurDataURL(): string {
  // Simple 1x1 pixel blur placeholder
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
}

/**
 * Get responsive image sizes for different breakpoints
 */
export function getResponsiveImageSizes(): string {
  return [
    '(max-width: 640px) 100vw',
    '(max-width: 768px) 90vw',
    '(max-width: 1024px) 80vw',
    '(max-width: 1280px) 70vw',
    '1200px'
  ].join(', ');
}

/**
 * Preload critical images for better performance
 */
export function preloadCriticalImages(imageUrls: string[]): void {
  if (typeof window === 'undefined') return;

  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.type = 'image/webp';
    document.head.appendChild(link);
  });
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(baseUrl: string, sizes: number[]): string {
  return sizes
    .map(size => `${baseUrl}?w=${size}&q=85 ${size}w`)
    .join(', ');
}

/**
 * Image loading performance monitoring
 */
export function monitorImageLoading(imageElement: HTMLImageElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    const onLoad = () => {
      const loadTime = performance.now() - startTime;
      console.log(`Image loaded in ${loadTime.toFixed(2)}ms`);
      cleanup();
      resolve();
    };
    
    const onError = () => {
      console.error('Image failed to load');
      cleanup();
      reject(new Error('Image load failed'));
    };
    
    const cleanup = () => {
      imageElement.removeEventListener('load', onLoad);
      imageElement.removeEventListener('error', onError);
    };
    
    if (imageElement.complete) {
      onLoad();
    } else {
      imageElement.addEventListener('load', onLoad);
      imageElement.addEventListener('error', onError);
    }
  });
}

/**
 * Lazy loading intersection observer for images
 */
export function createImageLazyLoader(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null;
  }
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  );
}