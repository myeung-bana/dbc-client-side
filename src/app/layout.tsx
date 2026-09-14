import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { LoginOverlayProvider } from '@/components/login-overlay-provider'
import { Toaster } from '@/components/ui/sonner'
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
  title: 'DBC Player',
  description: 'Book badminton sessions across your spaces',
  applicationName: 'DBC Player',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DBC Player',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#171717',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${geistSans.className} min-h-full font-sans`}>
        <LoginOverlayProvider>
          {children}
          <Toaster richColors closeButton />
        </LoginOverlayProvider>
      </body>
    </html>
  )
}
