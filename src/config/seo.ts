/**
 * SEO configuration for production deployment
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  siteUrl: string;
  siteName: string;
  locale: string;
  type: string;
  twitterHandle?: string;
  images: {
    og: string;
    ogSquare: string;
    twitter: string;
    favicon: string;
  };
}

export const seoConfig: SEOConfig = {
  title: 'Interactive Character Reference Sheet',
  description: 'Explore character design with interactive color mapping. Hover over different areas to discover detailed color information including hex, RGB, and HSL values.',
  keywords: [
    'character design',
    'reference sheet',
    'color palette',
    'interactive art',
    'character art',
    'color mapping',
    'digital art',
    'character development',
    'art portfolio',
    'color theory',
    'hex codes',
    'RGB values',
    'HSL colors',
    'character illustration',
    'digital illustration'
  ],
  author: 'Character Artist',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://interactive-character-refsheet.vercel.app',
  siteName: 'Interactive Character Reference Sheet',
  locale: 'en_US',
  type: 'website',
  twitterHandle: '@characterartist',
  images: {
    og: '/images/og-image.jpg',
    ogSquare: '/images/og-image-square.jpg',
    twitter: '/images/twitter-image.jpg',
    favicon: '/favicon.ico'
  }
};

/**
 * Generate structured data for the website
 */
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    description: seoConfig.description,
    url: seoConfig.siteUrl,
    author: {
      '@type': 'Person',
      name: seoConfig.author
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.siteUrl}?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    mainEntity: {
      '@type': 'CreativeWork',
      name: 'Character Reference Sheet',
      description: 'Interactive character design with color exploration',
      creator: {
        '@type': 'Person',
        name: seoConfig.author
      }
    }
  };
}

/**
 * Generate structured data for the artwork
 */
export function generateArtworkStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: 'Interactive Character Reference Sheet',
    description: 'Character reference sheet with interactive color exploration and detailed color information',
    creator: {
      '@type': 'Person',
      name: seoConfig.author
    },
    artMedium: 'Digital Art',
    artworkSurface: 'Digital Canvas',
    genre: 'Character Design',
    keywords: seoConfig.keywords,
    image: `${seoConfig.siteUrl}${seoConfig.images.og}`,
    url: seoConfig.siteUrl,
    dateCreated: new Date().toISOString().split('T')[0],
    license: 'All rights reserved',
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/ViewAction',
      userInteractionCount: 0
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Artists, Designers, Character Creators'
    }
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: seoConfig.siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Character Reference Sheet',
        item: seoConfig.siteUrl
      }
    ]
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I explore the character colors?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply hover your mouse over different areas of the character reference sheet. Interactive color segments will highlight and display detailed color information including hex codes, RGB, and HSL values.'
        }
      },
      {
        '@type': 'Question',
        name: 'What color formats are displayed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The interactive color panel shows three color formats: Hex codes (e.g., #FF5733), RGB values (e.g., RGB(255, 87, 51)), and HSL values (e.g., HSL(12°, 100%, 60%)).'
        }
      },
      {
        '@type': 'Question',
        name: 'Does this work on mobile devices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! The interactive character reference sheet is fully responsive and supports touch interactions on mobile devices. Simply tap on color segments to view color information.'
        }
      }
    ]
  };
}