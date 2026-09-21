import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AppleSplashHead } from '@/components/apple-splash-head'
import { HapticProvider } from '@/components/haptic-provider'
import { LoginOverlayProvider } from '@/components/login-overlay-provider'
import { ProfileAvatarProvider } from '@/components/profile-avatar-provider'
import { Toaster } from '@/components/ui/sonner'
import {
  createClientAppMetadata,
  createClientAppViewport,
} from '@/lib/pwa-metadata'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = createClientAppMetadata()

export const viewport: Viewport = createClientAppViewport()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <AppleSplashHead />
      </head>
      <body className={`${geistSans.className} min-h-full font-sans`}>
        <HapticProvider>
          <LoginOverlayProvider>
            <ProfileAvatarProvider>
              {children}
              <Toaster richColors closeButton />
            </ProfileAvatarProvider>
          </LoginOverlayProvider>
        </HapticProvider>
      </body>
    </html>
  )
}
