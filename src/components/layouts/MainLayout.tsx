'use client'

import { Navigation } from '@/components/Navigation'

interface MainLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
}

export function MainLayout({
  children,
  showNavigation = true,
}: MainLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50'>
      {showNavigation && <Navigation />}
      <main className='flex-1'>{children}</main>
    </div>
  )
}
