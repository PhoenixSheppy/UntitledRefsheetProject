import { ColorInfo, RGB, ImageDimensions } from '../types';
import { rgbToHex, rgbToHsl } from './colorConversion';

/**
 * Error thrown when color extraction operations fail
 */
export class ColorExtractionError extends Error {
    constructor(message: string, public readonly cause?: Error) {
        super(message);
        this.name = 'ColorExtractionError';
    }
}

/**
 * Cache for storing extracted colors to improve performance
 */
class ColorExtractionCache {
    private cache = new Map<string, ColorInfo>();
    private maxSize = 100; // Maximum number of cached colors

    /**
     * Generate a cache key for the given parameters
     */
    private generateKey(imageUrl: string, x: number, y: number): string {
        return `${imageUrl}:${x}:${y}`;
    }

    /**
     * Get cached color information
     */
    get(imageUrl: string, x: number, y: number): ColorInfo | undefined {
        return this.cache.get(this.generateKey(imageUrl, x, y));
    }

    /**
     * Set cached color information
     */
    set(imageUrl: string, x: number, y: number, colorInfo: ColorInfo): void {
        const key = this.generateKey(imageUrl, x, y);

        // If cache is full, remove oldest entry
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, colorInfo);
    }

    /**
     * Clear the cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    get size(): number {
        return this.cache.size;
    }
}

// Global cache instance
const colorCache = new ColorExtractionCache();

/**
 * Validates that coordinates are within image bounds
 */
function validateCoordinates(
    x: number,
    y: number,
    imageDimensions: ImageDimensions
): void {
    if (x < 0 || x >= imageDimensions.width) {
        throw new ColorExtractionError(
            `X coordinate ${x} is out of bounds. Image width: ${imageDimensions.width}`
        );
    }

    if (y < 0 || y >= imageDimensions.height) {
        throw new ColorExtractionError(
            `Y coordinate ${y} is out of bounds. Image height: ${imageDimensions.height}`
        );
    }
}

/**
 * Creates a canvas element and loads an image into it
 */
async function createCanvasFromImage(imageElement: HTMLImageElement): Promise<{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    dimensions: ImageDimensions;
}> {
    return new Promise((resolve, reject) => {
        try {
            // Create canvas element
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                throw new ColorExtractionError('Failed to get 2D canvas context');
            }

            // Set canvas dimensions to match image
            canvas.width = imageElement.naturalWidth || imageElement.width;
            canvas.height = imageElement.naturalHeight || imageElement.height;

            const dimensions: ImageDimensions = {
                width: canvas.width,
                height: canvas.height
            };

            // Handle image load
            const handleImageLoad = () => {
                try {
                    // Draw image to canvas
                    context.drawImage(imageElement, 0, 0);
                    resolve({ canvas, context, dimensions });
                } catch (error) {
                    reject(new ColorExtractionError(
                        'Failed to draw image to canvas',
                        error instanceof Error ? error : new Error(String(error))
                    ));
                }
            };

            // Handle image error
            const handleImageError = () => {
                reject(new ColorExtractionError('Failed to load image for canvas'));
            };

            // Check if image is already loaded
            if (imageElement.complete && imageElement.naturalWidth > 0) {
                handleImageLoad();
            } else {
                // Wait for image to load
                imageElement.addEventListener('load', handleImageLoad, { once: true });
                imageElement.addEventListener('error', handleImageError, { once: true });
            }
        } catch (error) {
            reject(new ColorExtractionError(
                'Failed to create canvas from image',
                error instanceof Error ? error : new Error(String(error))
            ));
        }
    });
}

/**
 * Extracts pixel data from canvas at specific coordinates
 */
function extractPixelData(
    context: CanvasRenderingContext2D,
    x: number,
    y: number
): RGB {
    try {
        // Get pixel data (1x1 pixel)
        const imageData = context.getImageData(x, y, 1, 1);
        const data = imageData.data;

        // Extract RGB values (alpha is ignored)
        return {
            r: data[0],
            g: data[1],
            b: data[2]
        };
    } catch (error) {
        throw new ColorExtractionError(
            `Failed to extract pixel data at coordinates (${x}, ${y})`,
            error instanceof Error ? error : new Error(String(error))
        );
    }
}

/**
 * Converts RGB values to complete ColorInfo object
 */
function createColorInfo(rgb: RGB): ColorInfo {
    try {
        const hex = rgbToHex(rgb);
        const hsl = rgbToHsl(rgb);

        return {
            hex,
            rgb,
            hsl
        };
    } catch (error) {
        throw new ColorExtractionError(
            'Failed to convert RGB to color information',
            error instanceof Error ? error : new Error(String(error))
        );
    }
}

/**
 * Extracts color information from an image at specific coordinates
 * @param imageElement - The HTML image element to extract color from
 * @param x - X coordinate in pixels (0-based)
 * @param y - Y coordinate in pixels (0-based)
 * @returns Promise that resolves to ColorInfo object
 * @throws ColorExtractionError if extraction fails
 */
export async function extractColorFromImage(
    imageElement: HTMLImageElement,
    x: number,
    y: number
): Promise<ColorInfo> {
    try {
        // Check cache first
        const imageUrl = imageElement.src;
        const cachedColor = colorCache.get(imageUrl, x, y);
        if (cachedColor) {
            return cachedColor;
        }

        // Create canvas and load image
        const { context, dimensions } = await createCanvasFromImage(imageElement);

        // Validate coordinates
        validateCoordinates(x, y, dimensions);

        // Extract pixel data
        const rgb = extractPixelData(context, x, y);

        // Create color information
        const colorInfo = createColorInfo(rgb);

        // Cache the result
        colorCache.set(imageUrl, x, y, colorInfo);

        return colorInfo;
    } catch (error) {
        if (error instanceof ColorExtractionError) {
            throw error;
        }
        throw new ColorExtractionError(
            'Unexpected error during color extraction',
            error instanceof Error ? error : new Error(String(error))
        );
    }
}

/**
 * Extracts color information from an image URL at specific coordinates
 * @param imageUrl - URL of the image to extract color from
 * @param x - X coordinate in pixels (0-based)
 * @param y - Y coordinate in pixels (0-based)
 * @returns Promise that resolves to ColorInfo object
 * @throws ColorExtractionError if extraction fails
 */
export async function extractColorFromImageUrl(
    imageUrl: string,
    x: number,
    y: number
): Promise<ColorInfo> {
    return new Promise((resolve, reject) => {
        try {
            // Check cache first
            const cachedColor = colorCache.get(imageUrl, x, y);
            if (cachedColor) {
                resolve(cachedColor);
                return;
            }

            // Create image element
            const imageElement = new Image();

            // Handle CORS for external images
            imageElement.crossOrigin = 'anonymous';

            imageElement.onload = async () => {
                try {
                    const colorInfo = await extractColorFromImage(imageElement, x, y);
                    resolve(colorInfo);
                } catch (error) {
                    reject(error);
                }
            };

            imageElement.onerror = () => {
                reject(new ColorExtractionError(`Failed to load image from URL: ${imageUrl}`));
            };

            imageElement.src = imageUrl;
        } catch (error) {
            reject(new ColorExtractionError(
                'Failed to create image element for color extraction',
                error instanceof Error ? error : new Error(String(error))
            ));
        }
    });
}

/**
 * Extracts multiple colors from an image at different coordinates
 * @param imageElement - The HTML image element to extract colors from
 * @param coordinates - Array of {x, y} coordinate pairs
 * @returns Promise that resolves to array of ColorInfo objects
 * @throws ColorExtractionError if extraction fails
 */
export async function extractMultipleColors(
    imageElement: HTMLImageElement,
    coordinates: Array<{ x: number; y: number }>
): Promise<ColorInfo[]> {
    try {
        // Create canvas once for all extractions
        const { context, dimensions } = await createCanvasFromImage(imageElement);
        const imageUrl = imageElement.src;
        const results: ColorInfo[] = [];

        for (const coord of coordinates) {
            try {
                // Check cache first
                const cachedColor = colorCache.get(imageUrl, coord.x, coord.y);
                if (cachedColor) {
                    results.push(cachedColor);
                    continue;
                }

                // Validate coordinates
                validateCoordinates(coord.x, coord.y, dimensions);

                // Extract pixel data
                const rgb = extractPixelData(context, coord.x, coord.y);

                // Create color information
                const colorInfo = createColorInfo(rgb);

                // Cache the result
                colorCache.set(imageUrl, coord.x, coord.y, colorInfo);

                results.push(colorInfo);
            } catch (error) {
                throw new ColorExtractionError(
                    `Failed to extract color at coordinates (${coord.x}, ${coord.y})`,
                    error instanceof Error ? error : new Error(String(error))
                );
            }
        }

        return results;
    } catch (error) {
        if (error instanceof ColorExtractionError) {
            throw error;
        }
        throw new ColorExtractionError(
            'Unexpected error during multiple color extraction',
            error instanceof Error ? error : new Error(String(error))
        );
    }
}

/**
 * Gets the dimensions of an image element
 * @param imageElement - The HTML image element
 * @returns ImageDimensions object
 */
export function getImageDimensions(imageElement: HTMLImageElement): ImageDimensions {
    return {
        width: imageElement.naturalWidth || imageElement.width,
        height: imageElement.naturalHeight || imageElement.height
    };
}

/**
 * Clears the color extraction cache
 */
export function clearColorCache(): void {
    colorCache.clear();
}

/**
 * Gets the current size of the color extraction cache
 */
export function getColorCacheSize(): number {
    return colorCache.size;
}

/**
 * Checks if canvas is supported in the current environment
 */
export function isCanvasSupported(): boolean {
    try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    } catch {
        return false;
    }
}