import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/providers/AuthProvider'
import { JuniorAuthProvider } from '@/providers/JuniorAuthProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Sistema Rodapolo',
  description: 'Plataforma de gestión para polo con monociclos eléctricos',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <JuniorAuthProvider>{children}</JuniorAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
