import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { WebSiteStructuredData } from '@/components/StructuredData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Interactive Character Reference Sheet',
    template: '%s | Interactive Character Reference Sheet',
  },
  description: 'Explore character design with interactive color mapping. Hover over different areas to discover detailed color information including hex, RGB, and HSL values.',
  keywords: [
    'character design',
    'reference sheet',
    'color palette',
    'interactive',
    'character art',
    'color mapping',
    'digital art',
    'character development',
    'art portfolio',
    'color theory'
  ],
  authors: [{ name: 'Character Artist' }],
  creator: 'Character Artist',
  publisher: 'Interactive Character Reference Sheet',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Interactive Character Reference Sheet',
    description: 'Explore character design with interactive color mapping. Discover detailed color information by hovering over different areas of the character artwork.',
    siteName: 'Interactive Character Reference Sheet',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Interactive Character Reference Sheet Preview',
      },
      {
        url: '/images/og-image-square.jpg',
        width: 1200,
        height: 1200,
        alt: 'Interactive Character Reference Sheet Square Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Character Reference Sheet',
    description: 'Explore character design with interactive color mapping',
    images: ['/images/twitter-image.jpg'],
    creator: '@characterartist',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
  category: 'Art & Design',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <WebSiteStructuredData />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
          <main className="container-responsive py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}