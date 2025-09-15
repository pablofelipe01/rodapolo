import { Metadata } from 'next'
import { MainLayout } from '@/components/layouts/MainLayout'

export const metadata: Metadata = {
  title: 'Dashboard Parental - Rodapolo',
  description: 'Panel de padres de familia - Rodapolo',
}

export default function ParentalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
          {children}
        </div>
      </div>
    </MainLayout>
  )
}
