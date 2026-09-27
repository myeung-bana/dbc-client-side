import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/nhost/admin'
import { getOptionalServerSession } from '@/lib/nhost/server'
import { getStorageFileUrl } from '@/lib/nhost/storage'

type RouteContext = {
  params: Promise<{ fileId: string }>
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Avatars are immutable per file id; callers bust the cache with ?v=<revision>.
const CACHE_CONTROL = 'private, max-age=3600'

function imageResponse(storageResponse: Response) {
  const headers = new Headers()
  headers.set(
    'Content-Type',
    storageResponse.headers.get('content-type') ?? 'application/octet-stream',
  )
  headers.set('Cache-Control', CACHE_CONTROL)

  return new NextResponse(storageResponse.body, {
    status: 200,
    headers,
  })
}

/** Fetch on the server and return bytes. A browser redirect to storage fails to paint. */
async function fetchImage(url: string) {
  const storageResponse = await fetch(url, { cache: 'no-store' })
  if (!storageResponse.ok || !storageResponse.body) return null
  return imageResponse(storageResponse)
}

export async function GET(_request: Request, context: RouteContext) {
  const { fileId } = await context.params

  if (!UUID_PATTERN.test(fileId)) {
    return NextResponse.json({ error: 'Invalid file id' }, { status: 400 })
  }

  const admin = createAdminClient()
  if (admin) {
    try {
      const { body } = await admin.storage.getFilePresignedURL(fileId)
      if (body.url) {
        const response = await fetchImage(body.url)
        if (response) return response
      }
    } catch {
      // Fall through to the session URL, then the public file URL.
    }
  }

  const auth = await getOptionalServerSession()
  if (auth.ok) {
    try {
      const { body } = await auth.nhost.storage.getFilePresignedURL(fileId)
      if (body.url) {
        const response = await fetchImage(body.url)
        if (response) return response
      }
    } catch {
      // Fall through to the public file URL.
    }
  }

  const response = await fetchImage(getStorageFileUrl(fileId))
  if (response) return response

  return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
}
