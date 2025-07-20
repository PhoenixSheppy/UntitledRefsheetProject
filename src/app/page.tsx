import { Metadata } from 'next'
import { RefSheetPage } from '@/components/RefSheetPage'
import { sampleRefSheetConfig } from '@/config/sampleRefSheet'

export const metadata: Metadata = {
  title: 'Character Reference Sheet - Interactive Color Explorer',
  description: 'Explore character design colors interactively by hovering over different areas to see detailed color information.',
  keywords: ['character design', 'color palette', 'reference sheet', 'interactive', 'art'],
  openGraph: {
    title: 'Interactive Character Reference Sheet',
    description: 'Discover the color palette used in character artwork through interactive exploration.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <RefSheetPage 
          config={sampleRefSheetConfig}
          className="max-w-6xl mx-auto"
        />
      </div>
    </main>
  )
}