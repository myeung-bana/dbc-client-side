import type { MetadataRoute } from 'next'
import { createClientAppManifest } from '@/lib/pwa-metadata'

export default function manifest(): MetadataRoute.Manifest {
  return createClientAppManifest()
}
