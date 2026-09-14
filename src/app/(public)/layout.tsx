import { getOptionalServerSession } from '@/lib/nhost/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  await getOptionalServerSession()
  return children
}
