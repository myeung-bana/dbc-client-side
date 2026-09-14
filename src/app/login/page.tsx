import { LoginForm } from '@/app/login/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const initialError =
    params.error === 'session-expired' ? 'Your session expired. Please sign in again.' : null
  const nextPath =
    params.next && params.next.startsWith('/') && !params.next.startsWith('//')
      ? params.next
      : null

  return <LoginForm initialError={initialError} nextPath={nextPath} />
}
