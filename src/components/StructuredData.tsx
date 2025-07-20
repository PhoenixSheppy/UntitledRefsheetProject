/**
 * Structured Data component for SEO optimization
 */

interface StructuredDataProps {
  type: 'WebSite' | 'CreativeWork' | 'VisualArtwork';
  data: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

export function WebSiteStructuredData() {
  return (
    <StructuredData
      type="WebSite"
      data={{
        name: 'Interactive Character Reference Sheet',
        description: 'Explore character design with interactive color mapping',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function ArtworkStructuredData() {
  return (
    <StructuredData
      type="VisualArtwork"
      data={{
        name: 'Interactive Character Reference Sheet',
        description: 'Character reference sheet with interactive color exploration',
        creator: {
          '@type': 'Person',
          name: 'Character Artist',
        },
        artMedium: 'Digital Art',
        artworkSurface: 'Digital Canvas',
        genre: 'Character Design',
        keywords: [
          'character design',
          'reference sheet',
          'color palette',
          'interactive art',
          'digital illustration',
        ],
        image: '/images/character-refsheet-preview.jpg',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        dateCreated: new Date().toISOString().split('T')[0],
        license: 'All rights reserved',
      }}
    />
  );
}