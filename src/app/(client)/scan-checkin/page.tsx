import { redirect } from 'next/navigation'

export default function ScanCheckinPage() {
  redirect('/passes?scan=1')
}
