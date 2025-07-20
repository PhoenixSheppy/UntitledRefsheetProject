import { Metadata } from 'next'
import { RefSheetPage } from '@/components/RefSheetPage'
import { sampleRefSheetConfig } from '@/config/sampleRefSheet'
import { ArtworkStructuredData } from '@/components/StructuredData'

export const metadata: Metadata = {
  title: 'Character Reference Sheet - Interactive Color Explorer',
  description: 'Explore character design colors interactively by hovering over different areas to see detailed color information including hex codes, RGB, and HSL values.',
  keywords: [
    'character design',
    'color palette',
    'reference sheet',
    'interactive',
    'art',
    'color explorer',
    'hex codes',
    'RGB values',
    'HSL colors',
    'character art portfolio'
  ],
  openGraph: {
    title: 'Interactive Character Reference Sheet - Color Explorer',
    description: 'Discover the color palette used in character artwork through interactive exploration. Hover over different areas to reveal detailed color information.',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/images/character-refsheet-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'Interactive Character Reference Sheet with Color Mapping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Character Reference Sheet',
    description: 'Explore character colors interactively - hover to discover hex, RGB, and HSL values',
    images: ['/images/character-refsheet-twitter.jpg'],
  },
}

export default function HomePage() {
  return (
    <>
      <ArtworkStructuredData />
      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="container mx-auto px-4 py-8">
          <RefSheetPage 
            config={sampleRefSheetConfig}
            className="max-w-6xl mx-auto"
          />
        </div>
      </main>
    </>
  )
}