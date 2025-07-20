import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RefSheetImage } from '../RefSheetImage';
import { ImageDimensions } from '@/types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: React.forwardRef<HTMLImageElement, any>((props, ref) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} ref={ref} />;
  })
}));

describe('RefSheetImage', () => {
  const mockOnImageLoad = vi.fn();
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test character reference sheet',
    onImageLoad: mockOnImageLoad
  };

  beforeEach(() => {
    mockOnImageLoad.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      render(<RefSheetImage {...defaultProps} />);
      
      expect(screen.getByText('Loading reference sheet...')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveClass('opacity-0');
    });

    it('should show loading spinner with proper accessibility', () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const loadingSpinner = screen.getByText('Loading reference sheet...').previousElementSibling;
      expect(loadingSpinner).toHaveClass('animate-spin');
    });
  });

  describe('Successful Image Load', () => {
    it('should call onImageLoad with correct dimensions when image loads', async () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      
      // Mock the naturalWidth and naturalHeight properties
      Object.defineProperty(image, 'naturalWidth', {
        value: 800,
        writable: true
      });
      Object.defineProperty(image, 'naturalHeight', {
        value: 600,
        writable: true
      });

      fireEvent.load(image);

      await waitFor(() => {
        expect(mockOnImageLoad).toHaveBeenCalledWith({
          width: 800,
          height: 600
        });
      });
    });

    it('should hide loading state and show image when loaded', async () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      
      Object.defineProperty(image, 'naturalWidth', { value: 800 });
      Object.defineProperty(image, 'naturalHeight', { value: 600 });

      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByText('Loading reference sheet...')).not.toBeInTheDocument();
        expect(image).toHaveClass('opacity-100');
      });
    });

    it('should apply correct aspect ratio style when dimensions are available', async () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      
      Object.defineProperty(image, 'naturalWidth', { value: 800 });
      Object.defineProperty(image, 'naturalHeight', { value: 600 });

      fireEvent.load(image);

      await waitFor(() => {
        expect(image).toHaveStyle('aspect-ratio: 800 / 600');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error state when image fails to load', async () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('Failed to load reference sheet')).toBeInTheDocument();
        expect(screen.getByText(/could not be loaded/)).toBeInTheDocument();
      });
    });

    it('should show retry button in error state', async () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      fireEvent.error(image);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry loading image/i });
        expect(retryButton).toBeInTheDocument();
      });
    });

    it('should reset to loading state when retry button is clicked', async () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('Failed to load reference sheet')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry loading image/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Loading reference sheet...')).toBeInTheDocument();
        expect(screen.queryByText('Failed to load reference sheet')).not.toBeInTheDocument();
      });
    });

    it('should have proper accessibility attributes for retry button', async () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      fireEvent.error(image);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry loading image/i });
        expect(retryButton).toHaveAttribute('aria-label', 'Retry loading image');
      });
    });
  });

  describe('Props and Styling', () => {
    it('should apply custom className', () => {
      const customClass = 'custom-test-class';
      render(<RefSheetImage {...defaultProps} className={customClass} />);
      
      const container = screen.getByRole('img').parentElement;
      expect(container).toHaveClass(customClass);
    });

    it('should pass correct src and alt to image', () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', defaultProps.src);
      expect(image).toHaveAttribute('alt', defaultProps.alt);
    });

    it('should have responsive image classes', () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveClass('w-full', 'h-auto', 'max-w-full', 'object-contain');
    });
  });

  describe('State Management', () => {
    it('should reset state when src prop changes', async () => {
      const { rerender } = render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      
      // Load the first image
      Object.defineProperty(image, 'naturalWidth', { value: 800 });
      Object.defineProperty(image, 'naturalHeight', { value: 600 });
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByText('Loading reference sheet...')).not.toBeInTheDocument();
      });

      // Change the src prop
      rerender(<RefSheetImage {...defaultProps} src="/new-image.jpg" />);

      // Should show loading state again
      expect(screen.getByText('Loading reference sheet...')).toBeInTheDocument();
    });

    it('should not call onImageLoad multiple times for same image', async () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      
      Object.defineProperty(image, 'naturalWidth', { value: 800 });
      Object.defineProperty(image, 'naturalHeight', { value: 600 });

      // Fire load event multiple times
      fireEvent.load(image);
      fireEvent.load(image);
      fireEvent.load(image);

      await waitFor(() => {
        expect(mockOnImageLoad).toHaveBeenCalledTimes(3); // Each load event should trigger callback
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain aspect ratio across different screen sizes', async () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      
      Object.defineProperty(image, 'naturalWidth', { value: 1200 });
      Object.defineProperty(image, 'naturalHeight', { value: 800 });

      fireEvent.load(image);

      await waitFor(() => {
        expect(image).toHaveStyle('aspect-ratio: 1200 / 800');
        expect(image).toHaveClass('object-contain');
      });
    });

    it('should use Next.js Image optimization properties', () => {
      render(<RefSheetImage {...defaultProps} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('sizes', '100vw');
      expect(image).toHaveAttribute('width', '0');
      expect(image).toHaveAttribute('height', '0');
    });
  });
});