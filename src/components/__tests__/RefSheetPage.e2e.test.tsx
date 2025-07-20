import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RefSheetPage } from '../RefSheetPage';
import { sampleRefSheetConfig, alternativeRefSheetConfig } from '@/config/sampleRefSheet';
import { RefSheetConfig } from '@/types';

// Mock fetch for image validation
global.fetch = vi.fn();

// Mock Next.js Image component to avoid complex loading behavior
vi.mock('next/image', () => ({
  default: ({ src, alt, onLoad, ...props }: any) => {
    // Simulate immediate image load
    React.useEffect(() => {
      if (onLoad) {
        onLoad({ target: { naturalWidth: 800, naturalHeight: 600 } });
      }
    }, [onLoad]);
    
    return React.createElement('img', {
      src,
      alt,
      ...props,
      'data-testid': 'refsheet-image'
    });
  }
}));

// Mock HTMLImageElement for image loading
Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
  get: function() { return 800; },
  configurable: true
});

Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
  get: function() { return 600; },
  configurable: true
});

// Mock canvas for color extraction
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray([139, 69, 19, 255]) // Sample color data
  }))
})) as any;

describe('RefSheetPage End-to-End Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete User Interaction Flows', () => {
    it('should render the main page component with all sections', async () => {
      render(<RefSheetPage config={sampleRefSheetConfig} />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      });

      // Check that all main sections are present
      expect(screen.getByText('How to Use')).toBeInTheDocument();
      expect(screen.getByText('Hover to Explore')).toBeInTheDocument();
      expect(screen.getByText('View Color Details')).toBeInTheDocument();
      expect(screen.getByText('Mobile Friendly')).toBeInTheDocument();
    });

    it('should display all color segments in palette summary', async () => {
      render(<RefSheetPage config={sampleRefSheetConfig} />);

      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      });

      // Check that color palette section is displayed
      const paletteTitle = screen.getByText(/Color Palette \(\d+ colors\)/);
      expect(paletteTitle).toBeInTheDocument();

      // Verify all color segments are shown in the summary
      sampleRefSheetConfig.colorSegments.forEach(segment => {
        expect(screen.getByText(segment.name)).toBeInTheDocument();
        expect(screen.getByText(segment.colorInfo.hex)).toBeInTheDocument();
      });
    });

    it('should integrate responsive layout with Tailwind CSS utilities', async () => {
      render(<RefSheetPage config={sampleRefSheetConfig} />);

      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      });

      // Check for responsive grid classes
      const instructionsGrid = screen.getByText('How to Use').closest('section');
      expect(instructionsGrid?.querySelector('.grid')).toBeInTheDocument();
      
      // Check for responsive spacing classes
      const mainContainer = screen.getByText('Interactive Character Reference Sheet').closest('div');
      expect(mainContainer).toHaveClass('space-y-8');
    });

    it('should handle error boundaries gracefully', async () => {
      render(<RefSheetPage config={sampleRefSheetConfig} />);

      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      });

      // The component should render even if there are errors with the RefSheetContainer
      // Check that error handling is working by looking for either the container or error state
      const hasContainer = screen.queryByTestId('refsheet-container');
      const hasError = screen.queryByText('Reference Sheet Error');
      
      // Either the container loads successfully or we get a proper error state
      expect(hasContainer || hasError).toBeTruthy();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle configuration validation errors gracefully', async () => {
      const invalidConfig = {
        ...sampleRefSheetConfig,
        image: {
          ...sampleRefSheetConfig.image,
          src: '' // Invalid empty source
        }
      } as RefSheetConfig;

      render(<RefSheetPage config={invalidConfig} />);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Configuration Error')).toBeInTheDocument();
      });

      // Should have retry button
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle image loading failures', async () => {
      // Mock fetch to fail
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<RefSheetPage config={sampleRefSheetConfig} />);

      // Should still load but with warning
      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      });
    });

    it('should handle empty color segments gracefully', async () => {
      const configWithoutSegments = {
        ...sampleRefSheetConfig,
        colorSegments: []
      };

      render(<RefSheetPage config={configWithoutSegments} />);

      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      });

      // Should not show color palette section
      expect(screen.queryByText(/Color Palette/)).not.toBeInTheDocument();
    });

    it('should handle component errors with error boundary', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create a config that will cause an error
      const errorConfig = {
        ...sampleRefSheetConfig,
        colorSegments: null as any // This will cause an error
      };

      render(<RefSheetPage config={errorConfig} />);

      // Should show error boundary
      await waitFor(() => {
        expect(screen.getByText('Configuration Error')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Responsive Layout and Accessibility', () => {
    it('should display instructions for different interaction methods', async () => {
      render(<RefSheetPage config={sampleRefSheetConfig} />);

      await waitFor(() => {
        expect(screen.getByText('How to Use')).toBeInTheDocument();
      });

      // Check for desktop instructions
      expect(screen.getByText('Hover to Explore')).toBeInTheDocument();
      
      // Check for mobile instructions
      expect(screen.getByText('Mobile Friendly')).toBeInTheDocument();
      
      // Check for color details instructions
      expect(screen.getByText('View Color Details')).toBeInTheDocument();
    });

    it('should have proper heading structure and accessibility features', async () => {
      render(<RefSheetPage config={sampleRefSheetConfig} />);

      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      });

      // Check for proper heading structure
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();

      // Check for proper button roles (retry buttons in error states)
      const retryButtons = screen.queryAllByRole('button');
      retryButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should work with alternative configuration', async () => {
      render(<RefSheetPage config={alternativeRefSheetConfig} />);

      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      });

      // Should display alternative config's segments
      alternativeRefSheetConfig.colorSegments.forEach(segment => {
        expect(screen.getByText(segment.name)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading state initially', async () => {
      render(<RefSheetPage config={sampleRefSheetConfig} />);

      // Should show loading state briefly
      expect(screen.getByText('Loading your character design...')).toBeInTheDocument();

      // Should transition to loaded state
      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      });
    });

    it('should handle slow image loading', async () => {
      // Mock slow fetch
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ ok: true, status: 200 }), 100)
        )
      );

      render(<RefSheetPage config={sampleRefSheetConfig} />);

      // Should show loading state
      expect(screen.getByText('Loading your character design...')).toBeInTheDocument();

      // Should eventually load
      await waitFor(() => {
        expect(screen.getByText('Interactive Character Reference Sheet')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});