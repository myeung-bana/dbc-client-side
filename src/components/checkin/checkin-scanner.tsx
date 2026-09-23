'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  getCheckinContextAction,
  searchCheckinPlayersAction,
  submitCheckinScanAction,
  submitManualCheckinAction,
} from '@/app/actions/client'
import { InviteQrScannerView } from '@/components/invite-qr-scanner-view'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'

type SessionOption = {
  id: string
  spaceId: string
  title: string
  startsAt: string
}

type PlayerOption = {
  userId: string
  displayName: string
}

export function CheckinScanner({ showScanner = true }: { showScanner?: boolean }) {
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [sessionId, setSessionId] = useState('')
  const [scanning, setScanning] = useState(true)
  const [players, setPlayers] = useState<PlayerOption[]>([])
  const [query, setQuery] = useState('')
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    getCheckinContextAction().then((result) => {
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setSessions(result.data.sessions)
      setSessionId(result.data.sessions[0]?.id ?? '')
    })
  }, [])

  function onScan(value: string) {
    if (!value.startsWith('gachi-checkin.')) {
      toastError('That QR is not a check-in code')
      return
    }
    setScanning(false)
    startTransition(async () => {
      const result = await submitCheckinScanAction(value, sessionId || undefined)
      if (!result.ok) {
        toastError(result.error)
        setMessage(result.error)
        return
      }
      const text = `${result.data.playerName} checked in · ${result.data.creditsRemaining} credits left`
      setMessage(text)
      toastSuccess(text)
    })
  }

  function searchPlayers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const session = sessions.find((item) => item.id === sessionId)
    if (!session) {
      toastError('Choose a session first')
      return
    }
    startTransition(async () => {
      const result = await searchCheckinPlayersAction(session.spaceId, query)
      if (!result.ok) {
        toastError(result.error)
        return
      }
      setPlayers(result.data.players)
    })
  }

  function deduct(userId: string) {
    startTransition(async () => {
      const result = await submitManualCheckinAction(sessionId, userId)
      if (!result.ok) {
        toastError(result.error)
        setMessage(result.error)
        return
      }
      const text = `${result.data.playerName} checked in · ${result.data.creditsRemaining} credits left`
      setMessage(text)
      toastSuccess(text)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="checkin-session">Session</Label>
        <select
          id="checkin-session"
          className="flex h-10 w-full rounded-md border bg-transparent px-3 text-sm"
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
        >
          {sessions.length === 0 ? <option value="">No upcoming sessions</option> : null}
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title} · {new Date(session.startsAt).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {showScanner ? (
        <InviteQrScannerView
          scanning={scanning && !pending}
          onScan={onScan}
          onScanError={() => toastError('Could not read that QR code')}
          onResume={() => setScanning(true)}
        />
      ) : null}

      <form onSubmit={searchPlayers} className="space-y-2">
        <Label htmlFor="player-search">Walk-in without a QR</Label>
        <div className="flex gap-2">
          <Input
            id="player-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search casual players"
          />
          <Button type="submit" variant="outline" disabled={pending}>
            Search
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {players.map((player) => (
          <div key={player.userId} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <p className="text-sm font-medium">{player.displayName}</p>
            <Button size="sm" disabled={pending || !sessionId} onClick={() => deduct(player.userId)}>
              Deduct 1 credit
            </Button>
          </div>
        ))}
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  )
}
