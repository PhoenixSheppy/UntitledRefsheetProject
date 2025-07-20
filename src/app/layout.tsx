import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Interactive Character Reference Sheet',
  description: 'Explore character design with interactive color mapping',
  keywords: ['character design', 'reference sheet', 'color palette', 'interactive'],
  authors: [{ name: 'Character Artist' }],
  openGraph: {
    title: 'Interactive Character Reference Sheet',
    description: 'Explore character design with interactive color mapping',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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