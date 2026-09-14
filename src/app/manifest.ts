import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DBC Player',
    short_name: 'DBC',
    description: 'Book badminton sessions across your spaces',
    start_url: '/sessions',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#171717',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
