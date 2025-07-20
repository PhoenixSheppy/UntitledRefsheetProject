import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Character Reference Sheet - Interactive Color Explorer',
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient">
          Interactive Character Reference Sheet
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Explore the character design by hovering over different areas to discover the color palette used in the artwork.
        </p>
      </header>

      {/* Main Content Area - Placeholder for RefSheetContainer */}
      <section className="flex justify-center">
        <div className="card p-8 max-w-4xl w-full">
          <div className="aspect-video bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-neutral-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-700">
                Character Reference Sheet
              </h3>
              <p className="text-sm text-neutral-500">
                Interactive color mapping will be implemented here
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions Section */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-800">
          How to Use
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card p-6 space-y-3">
            <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">1</span>
            </div>
            <h3 className="font-medium text-neutral-800">Hover to Explore</h3>
            <p className="text-sm text-neutral-600">
              Move your cursor over different areas of the character to discover interactive color segments.
            </p>
          </div>
          
          <div className="card p-6 space-y-3">
            <div className="w-12 h-12 mx-auto bg-accent-100 rounded-full flex items-center justify-center">
              <span className="text-accent-600 font-bold text-lg">2</span>
            </div>
            <h3 className="font-medium text-neutral-800">View Color Details</h3>
            <p className="text-sm text-neutral-600">
              See detailed color information including hex codes, RGB, and HSL values in the popup panel.
            </p>
          </div>
          
          <div className="card p-6 space-y-3">
            <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">3</span>
            </div>
            <h3 className="font-medium text-neutral-800">Mobile Friendly</h3>
            <p className="text-sm text-neutral-600">
              On touch devices, tap the color segments to view the color information panel.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}