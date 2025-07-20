import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 ${className}`}>
      <div className="container-responsive py-8">
        {children}
      </div>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <header className={`text-center space-y-4 ${className}`}>
      <h1 className="text-4xl md:text-5xl font-bold text-gradient">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </header>
  )
}

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div className={`card ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}