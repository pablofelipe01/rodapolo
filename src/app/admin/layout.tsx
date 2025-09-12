import { Metadata } from 'next'
import { MainLayout } from '@/components/layouts/MainLayout'

export const metadata: Metadata = {
  title: 'Dashboard Admin - Rodapolo',
  description: 'Panel de administración de Rodapolo',
}

export default function AdminLayout({
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
