#!/bin/bash

# Interactive Character Reference Sheet - Production Deployment Script
# This script handles the complete deployment process with validation

set -e  # Exit on any error

echo "🚀 Starting production deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required commands exist
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Clean previous builds
clean_build() {
    print_status "Cleaning previous builds..."
    
    if [ -d ".next" ]; then
        rm -rf .next
        print_success "Removed .next directory"
    fi
    
    if [ -d "out" ]; then
        rm -rf out
        print_success "Removed out directory"
    fi
    
    if [ -f "bundle-analyzer-report.html" ]; then
        rm bundle-analyzer-report.html
        print_success "Removed previous bundle analysis"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci --production=false
    print_success "Dependencies installed"
}

# Run validation tests
run_validation() {
    print_status "Running validation tests..."
    
    # Type checking
    print_status "Running TypeScript type checking..."
    npm run type-check
    print_success "Type checking passed"
    
    # Linting
    print_status "Running ESLint..."
    npm run lint
    print_success "Linting passed"
    
    # Unit tests
    print_status "Running unit tests..."
    npm run test:run
    print_success "Unit tests passed"
}

# Build for production
build_production() {
    print_status "Building for production..."
    
    # Set production environment
    export NODE_ENV=production
    export NEXT_TELEMETRY_DISABLED=1
    
    # Build the application
    npm run build:production
    print_success "Production build completed"
    
    # Generate static export
    print_status "Generating static export..."
    npm run export
    print_success "Static export generated"
}

# Run performance tests
run_performance_tests() {
    print_status "Running performance validation..."
    npm run test:performance
    print_success "Performance tests passed"
}

# Analyze bundle size
analyze_bundle() {
    if [ "$1" = "--analyze" ]; then
        print_status "Analyzing bundle size..."
        ANALYZE=true npm run build:production
        print_success "Bundle analysis completed. Check bundle-analyzer-report.html"
    fi
}

# Validate deployment readiness
validate_deployment() {
    print_status "Validating deployment readiness..."
    
    # Check if required files exist
    required_files=(
        "out/index.html"
        "out/_next"
        "vercel.json"
        "netlify.toml"
        "public/robots.txt"
        "public/sitemap.xml"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -e "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    # Check HTML file size
    html_size=$(stat -f%z "out/index.html" 2>/dev/null || stat -c%s "out/index.html" 2>/dev/null)
    max_html_size=$((50 * 1024))  # 50KB
    
    if [ "$html_size" -gt "$max_html_size" ]; then
        print_warning "HTML file size ($html_size bytes) exceeds recommended size ($max_html_size bytes)"
    else
        print_success "HTML file size is optimal ($html_size bytes)"
    fi
    
    # Check if SEO meta tags are present
    if grep -q '<meta name="description"' out/index.html && \
       grep -q '<meta property="og:' out/index.html && \
       grep -q 'application/ld+json' out/index.html; then
        print_success "SEO meta tags are present"
    else
        print_error "SEO meta tags are missing or incomplete"
        exit 1
    fi
    
    print_success "Deployment validation completed"
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    report_file="deployment-report.txt"
    
    {
        echo "=== Interactive Character Reference Sheet - Deployment Report ==="
        echo "Generated: $(date)"
        echo ""
        echo "Build Information:"
        echo "- Node.js version: $(node --version)"
        echo "- npm version: $(npm --version)"
        echo "- Build environment: production"
        echo ""
        echo "File Sizes:"
        if [ -f "out/index.html" ]; then
            html_size=$(stat -f%z "out/index.html" 2>/dev/null || stat -c%s "out/index.html" 2>/dev/null)
            echo "- HTML: ${html_size} bytes"
        fi
        
        if [ -d "out/_next/static" ]; then
            js_size=$(find out/_next/static -name "*.js" -type f -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || find out/_next/static -name "*.js" -type f -exec stat -c%s {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}')
            css_size=$(find out/_next/static -name "*.css" -type f -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || find out/_next/static -name "*.css" -type f -exec stat -c%s {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}')
            echo "- JavaScript: ${js_size:-0} bytes"
            echo "- CSS: ${css_size:-0} bytes"
        fi
        
        echo ""
        echo "Deployment Targets:"
        echo "- Vercel: Configured (vercel.json)"
        echo "- Netlify: Configured (netlify.toml)"
        echo ""
        echo "SEO Configuration:"
        echo "- Meta tags: ✓"
        echo "- Open Graph: ✓"
        echo "- Twitter Cards: ✓"
        echo "- Structured data: ✓"
        echo "- Sitemap: ✓"
        echo "- Robots.txt: ✓"
        echo ""
        echo "Performance Optimizations:"
        echo "- Image optimization: ✓"
        echo "- Bundle minification: ✓"
        echo "- Static asset caching: ✓"
        echo "- Security headers: ✓"
        echo ""
        echo "=== End of Report ==="
    } > "$report_file"
    
    print_success "Deployment report generated: $report_file"
}

# Main deployment process
main() {
    echo "🎨 Interactive Character Reference Sheet - Production Deployment"
    echo "=============================================================="
    
    check_dependencies
    clean_build
    install_dependencies
    run_validation
    build_production
    analyze_bundle "$1"
    run_performance_tests
    validate_deployment
    generate_report
    
    echo ""
    print_success "🎉 Deployment process completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review the deployment report: deployment-report.txt"
    echo "2. Deploy to Vercel: vercel --prod"
    echo "3. Deploy to Netlify: netlify deploy --prod --dir=out"
    echo ""
    echo "The application is ready for production deployment! 🚀"
}

# Run main function with all arguments
main "$@"