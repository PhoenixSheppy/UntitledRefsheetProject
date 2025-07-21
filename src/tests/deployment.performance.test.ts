/**
 * Deployment and Performance Validation Tests
 * Tests production build performance and deployment readiness
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { execSync } from 'child_process'
import { existsSync, statSync, readFileSync } from 'fs'
import { join } from 'path'

describe('Deployment Performance Tests', () => {
  const buildDir = '.next'
  const outDir = 'out'
  
  beforeAll(() => {
    // Ensure production build exists
    if (!existsSync(buildDir)) {
      throw new Error('Production build not found. Run "npm run build:production" first.')
    }
  })

  describe('Build Output Validation', () => {
    it('should have generated static export files', () => {
      expect(existsSync(outDir)).toBe(true)
      expect(existsSync(join(outDir, 'index.html'))).toBe(true)
      expect(existsSync(join(outDir, '_next'))).toBe(true)
    })

    it('should have optimized static assets', () => {
      const staticDir = join(outDir, '_next', 'static')
      expect(existsSync(staticDir)).toBe(true)
      
      // Check for CSS optimization
      const cssFiles = execSync(`find ${staticDir} -name "*.css" 2>/dev/null || true`)
        .toString()
        .trim()
        .split('\n')
        .filter(Boolean)
      
      if (cssFiles.length > 0) {
        cssFiles.forEach(cssFile => {
          const stats = statSync(cssFile)
          // CSS files should be reasonably small (under 100KB for this project)
          expect(stats.size).toBeLessThan(100 * 1024)
        })
      }
    })

    it('should have minified JavaScript bundles', () => {
      const staticDir = join(outDir, '_next', 'static')
      const jsFiles = execSync(`find ${staticDir} -name "*.js" 2>/dev/null || true`)
        .toString()
        .trim()
        .split('\n')
        .filter(Boolean)
      
      if (jsFiles.length > 0) {
        jsFiles.forEach(jsFile => {
          const content = readFileSync(jsFile, 'utf-8')
          // Minified files should not contain excessive whitespace
          const whitespaceRatio = (content.match(/\s/g) || []).length / content.length
          expect(whitespaceRatio).toBeLessThan(0.3) // Less than 30% whitespace
        })
      }
    })

    it('should have proper file sizes for production', () => {
      const indexPath = join(outDir, 'index.html')
      const indexStats = statSync(indexPath)
      
      // HTML file should be reasonably sized (under 50KB)
      expect(indexStats.size).toBeLessThan(50 * 1024)
      
      // Check that HTML contains minified content
      const indexContent = readFileSync(indexPath, 'utf-8')
      expect(indexContent).toContain('<!DOCTYPE html>')
      expect(indexContent).toContain('<meta name="description"')
      expect(indexContent).toContain('<meta property="og:')
    })
  })

  describe('SEO and Meta Tags Validation', () => {
    it('should have proper SEO meta tags in HTML', () => {
      const indexPath = join(outDir, 'index.html')
      const content = readFileSync(indexPath, 'utf-8')
      
      // Essential SEO tags
      expect(content).toContain('<title>')
      expect(content).toContain('<meta name="description"')
      expect(content).toContain('<meta name="keywords"')
      expect(content).toContain('<meta name="author"')
      
      // Open Graph tags
      expect(content).toContain('<meta property="og:title"')
      expect(content).toContain('<meta property="og:description"')
      expect(content).toContain('<meta property="og:image"')
      expect(content).toContain('<meta property="og:type"')
      
      // Twitter Card tags
      expect(content).toContain('<meta name="twitter:card"')
      expect(content).toContain('<meta name="twitter:title"')
      expect(content).toContain('<meta name="twitter:description"')
      
      // Mobile optimization
      expect(content).toContain('<meta name="viewport"')
      expect(content).toContain('width=device-width')
    })

    it('should have structured data', () => {
      const indexPath = join(outDir, 'index.html')
      const content = readFileSync(indexPath, 'utf-8')
      
      // Should contain JSON-LD structured data
      expect(content).toContain('application/ld+json')
      expect(content).toContain('@context')
      expect(content).toContain('https://schema.org')
      expect(content).toContain('@type')
    })

    it('should have proper canonical URLs', () => {
      const indexPath = join(outDir, 'index.html')
      const content = readFileSync(indexPath, 'utf-8')
      
      expect(content).toContain('<link rel="canonical"')
    })
  })

  describe('Performance Optimization Validation', () => {
    it('should have proper caching headers configuration', () => {
      // This would be tested in the actual deployment environment
      // For now, we validate the configuration exists
      expect(existsSync('vercel.json')).toBe(true)
      
      const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf-8'))
      expect(vercelConfig.headers).toBeDefined()
      expect(Array.isArray(vercelConfig.headers)).toBe(true)
      
      // Check for static asset caching
      const staticCaching = vercelConfig.headers.find((h: any) => 
        h.source.includes('_next/static')
      )
      expect(staticCaching).toBeDefined()
      expect(staticCaching.headers.some((h: any) => 
        h.key === 'Cache-Control' && h.value.includes('max-age=31536000')
      )).toBe(true)
    })

    it('should have security headers configured', () => {
      const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf-8'))
      
      const securityHeaders = vercelConfig.headers.find((h: any) => 
        h.source === '/(.*)'
      )
      expect(securityHeaders).toBeDefined()
      
      const headerKeys = securityHeaders.headers.map((h: any) => h.key)
      expect(headerKeys).toContain('X-Content-Type-Options')
      expect(headerKeys).toContain('X-Frame-Options')
      expect(headerKeys).toContain('X-XSS-Protection')
      expect(headerKeys).toContain('Strict-Transport-Security')
    })

    it('should have image optimization configured', () => {
      const nextConfig = readFileSync('next.config.js', 'utf-8')
      
      expect(nextConfig).toContain('images:')
      expect(nextConfig).toContain('formats:')
      expect(nextConfig).toContain('webp')
      expect(nextConfig).toContain('avif')
      expect(nextConfig).toContain('unoptimized: false')
    })

    it('should have bundle size optimization', () => {
      const nextConfig = readFileSync('next.config.js', 'utf-8')
      
      expect(nextConfig).toContain('compiler:')
      expect(nextConfig).toContain('removeConsole')
      expect(nextConfig).toContain('splitChunks')
      expect(nextConfig).toContain('usedExports')
    })
  })

  describe('Static Asset Optimization', () => {
    it('should have optimized static assets structure', () => {
      const staticDir = join(outDir, '_next', 'static')
      
      if (existsSync(staticDir)) {
        // Check for proper file naming (should include hashes)
        const files = execSync(`find ${staticDir} -type f 2>/dev/null || true`)
          .toString()
          .trim()
          .split('\n')
          .filter(Boolean)
        
        if (files.length > 0) {
          // Most files should have hash-based names for cache busting
          const hashedFiles = files.filter(file => 
            /[a-f0-9]{8,}/.test(file) // Contains hash-like strings
          )
          expect(hashedFiles.length).toBeGreaterThan(0)
        }
      }
    })

    it('should have proper favicon and manifest files', () => {
      // Check for favicon in output
      const faviconExists = existsSync(join(outDir, 'favicon.ico'))
      if (!faviconExists) {
        // Favicon might be in public directory for static export
        expect(existsSync(join('public', 'favicon.ico'))).toBe(true)
      }
    })
  })

  describe('Deployment Configuration Validation', () => {
    it('should have proper build scripts', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
      
      expect(packageJson.scripts['build:production']).toBeDefined()
      expect(packageJson.scripts['test:deployment']).toBeDefined()
      expect(packageJson.scripts['validate:production']).toBeDefined()
      expect(packageJson.scripts['build:static']).toBeDefined()
    })

    it('should have deployment platform configuration', () => {
      // Vercel configuration
      expect(existsSync('vercel.json')).toBe(true)
      
      const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf-8'))
      expect(vercelConfig.buildCommand).toBeDefined()
      expect(vercelConfig.outputDirectory).toBeDefined()
      expect(vercelConfig.framework).toBe('nextjs')
    })

    it('should have environment-specific configurations', () => {
      const nextConfig = readFileSync('next.config.js', 'utf-8')
      
      // Should have production-specific optimizations
      expect(nextConfig).toContain('process.env.NODE_ENV === \'production\'')
      expect(nextConfig).toContain('compress: true')
      expect(nextConfig).toContain('poweredByHeader: false')
    })
  })
})

describe('Performance Benchmarks', () => {
  it('should meet performance budgets', () => {
    const staticDir = join('out', '_next', 'static')
    
    if (existsSync(staticDir)) {
      // Calculate total bundle size
      const jsFiles = execSync(`find ${staticDir} -name "*.js" -type f 2>/dev/null || true`)
        .toString()
        .trim()
        .split('\n')
        .filter(Boolean)
      
      if (jsFiles.length > 0) {
        const totalJSSize = jsFiles.reduce((total, file) => {
          return total + statSync(file).size
        }, 0)
        
        // Total JS bundle should be under 800KB for this app with Next.js
        expect(totalJSSize).toBeLessThan(800 * 1024)
      }
      
      const cssFiles = execSync(`find ${staticDir} -name "*.css" -type f 2>/dev/null || true`)
        .toString()
        .trim()
        .split('\n')
        .filter(Boolean)
      
      if (cssFiles.length > 0) {
        const totalCSSSize = cssFiles.reduce((total, file) => {
          return total + statSync(file).size
        }, 0)
        
        // Total CSS should be under 100KB
        expect(totalCSSSize).toBeLessThan(100 * 1024)
      }
    }
  })

  it('should have reasonable HTML size', () => {
    const indexPath = join('out', 'index.html')
    const stats = statSync(indexPath)
    
    // HTML should be under 50KB
    expect(stats.size).toBeLessThan(50 * 1024)
  })
})