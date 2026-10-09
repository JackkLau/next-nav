'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2, Search, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

export interface RemovalSite {
  slug: string
  name: string
  url: string
  removedAt?: string
}

interface AccessResult {
  unlimited?: boolean
  rateLimit?: {
    limit: number
    remaining: number
    resetAt: string
    retryAfterSeconds: number
  }
}

interface RemovalResponse extends AccessResult {
  error?: string
  site?: RemovalSite
  duplicate?: boolean
  operation?: string
}

interface SiteRemovalProps {
  password: string
  url: string
  onUrlChange: (url: string) => void
  disabled: boolean
  onAccessResult: (result: AccessResult) => void
  onPasswordError: () => void
  onRemoved: (site: RemovalSite) => void
}

export default function SiteRemoval({
  password,
  url,
  onUrlChange: setUrl,
  disabled,
  onAccessResult,
  onPasswordError,
  onRemoved,
}: SiteRemovalProps) {
  const t = useTranslations('tools.nav-gen')
  const [target, setTarget] = useState<RemovalSite | null>(null)
  const [checking, setChecking] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [urlInvalid, setUrlInvalid] = useState(false)
  const [success, setSuccess] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const removeButtonRef = useRef<HTMLButtonElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const busyRef = useRef(false)
  const composingRef = useRef(false)
  const passwordErrorRef = useRef(false)

  useEffect(() => {
    return () => {
      requestRef.current?.abort()
    }
  }, [])

  const errorMessage = (data: RemovalResponse) => {
    if (data.error === 'INVALID_PASSWORD') return t('form.error.password')
    if (data.error === 'RATE_LIMITED')
      return t('form.error.rate-limited', {
        seconds: data.rateLimit?.retryAfterSeconds || 60,
      })
    if (data.error === 'INVALID_SITE') return t('form.error.url-format')
    if (data.error === 'SITE_NOT_FOUND') return t('removal.not-found')
    if (data.error === 'SITE_CHANGED') return t('removal.changed')
    if (
      data.error === 'SERVICE_NOT_CONFIGURED' ||
      data.error === 'SERVICE_UNAVAILABLE'
    )
      return t('form.error.service-unavailable')
    return t('removal.failed')
  }

  const sendRequest = async (
    action: 'check' | 'remove',
    controller: AbortController,
    site?: RemovalSite,
  ) => {
    const response = await fetch('/api/sites/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        action,
        url: site?.url || url.trim(),
        ...(site ? { existingSlug: site.slug } : {}),
      }),
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]),
    })
    const data = (await response.json().catch(() => ({}))) as RemovalResponse
    if (controller.signal.aborted) return null
    onAccessResult(data)
    if (!response.ok) {
      setError(errorMessage(data))
      if (data.error === 'INVALID_PASSWORD') {
        passwordErrorRef.current = true
        setTarget(null)
        setOpen(false)
        onPasswordError()
      }
      if (data.error === 'INVALID_SITE') {
        setUrlInvalid(true)
        inputRef.current?.focus()
      }
      if (data.error === 'SITE_CHANGED' || data.error === 'SITE_NOT_FOUND') {
        setTarget(null)
        setOpen(false)
      }
      return null
    }
    return data
  }

  const findSite = async (event: FormEvent) => {
    event.preventDefault()
    if (busyRef.current || disabled || composingRef.current) return
    setError('')
    setSuccess('')
    setTarget(null)
    if (!password) {
      setError(t('form.error.password-required'))
      onPasswordError()
      return
    }
    try {
      const parsed = new URL(url.trim())
      if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        parsed.username ||
        parsed.password
      )
        throw new Error('Invalid URL')
    } catch {
      setError(t('form.error.url-format'))
      setUrlInvalid(true)
      inputRef.current?.focus()
      return
    }
    const controller = new AbortController()
    requestRef.current = controller
    busyRef.current = true
    setChecking(true)
    try {
      const data = await sendRequest('check', controller)
      if (!data) return
      if (!data.duplicate || !data.site) {
        setError(t('removal.not-found'))
        return
      }
      setTarget(data.site)
    } catch {
      if (!controller.signal.aborted) setError(t('removal.failed'))
    } finally {
      if (!controller.signal.aborted) {
        busyRef.current = false
        setChecking(false)
      }
    }
  }

  const removeSite = async () => {
    if (!target || busyRef.current || disabled) return
    const controller = new AbortController()
    requestRef.current = controller
    busyRef.current = true
    setRemoving(true)
    setError('')
    try {
      const data = await sendRequest('remove', controller, target)
      if (!data) return
      if (data.operation !== 'removed' || !data.site?.removedAt) {
        setError(t('removal.failed'))
        return
      }
      const message = t('removal.success', { name: data.site.name })
      setSuccess(message)
      setTarget(data.site)
      setOpen(false)
      onRemoved(data.site)
      toast.success(message)
    } catch {
      if (!controller.signal.aborted) setError(t('removal.failed'))
    } finally {
      if (!controller.signal.aborted) {
        busyRef.current = false
        setRemoving(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-destructive" aria-hidden="true" />
          {t('removal.title')}
        </CardTitle>
        <CardDescription>{t('removal.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          noValidate
          onSubmit={findSite}
          className="space-y-3"
          onCompositionStart={() => {
            composingRef.current = true
          }}
          onCompositionEnd={() => {
            composingRef.current = false
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="removal-url">{t('removal.url')}</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="removal-url"
                type="url"
                maxLength={2048}
                value={url}
                placeholder="https://example.com"
                autoComplete="off"
                disabled={removing}
                className="pr-12"
                aria-invalid={urlInvalid}
                aria-describedby="removal-help removal-feedback"
                onChange={(event) => {
                  requestRef.current?.abort()
                  busyRef.current = false
                  setChecking(false)
                  setUrl(event.target.value)
                  setTarget(null)
                  setError('')
                  setSuccess('')
                  setUrlInvalid(false)
                }}
              />
              {url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-10 cursor-pointer active:opacity-80"
                  aria-label={t('removal.clear')}
                  disabled={removing}
                  onClick={() => {
                    requestRef.current?.abort()
                    busyRef.current = false
                    setChecking(false)
                    setUrl('')
                    setTarget(null)
                    setError('')
                    setSuccess('')
                    setUrlInvalid(false)
                    inputRef.current?.focus()
                  }}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
            <p id="removal-help" className="text-sm text-muted-foreground">
              {t('removal.password-help')}
            </p>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full cursor-pointer active:opacity-80"
            disabled={disabled || checking || removing}
            aria-busy={checking}
          >
            {checking ? (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {checking ? t('removal.checking') : t('removal.check')}
          </Button>
        </form>
        <div
          id="removal-feedback"
          className="min-h-6 text-sm"
          aria-live="polite"
        >
          {!open && error && <p className="text-destructive">{error}</p>}
          {success && <p>{success}</p>}
        </div>
        {target && (
          <div
            className="space-y-3 rounded-lg border bg-muted/40 p-4"
            aria-live="polite"
          >
            <p className="break-words font-medium">{target.name}</p>
            <p className="break-all font-mono text-sm text-muted-foreground">
              {target.url}
            </p>
            {target.removedAt ? (
              <p className="text-sm">
                {t('removal.already-removed', { name: target.name })}
              </p>
            ) : (
              <Button
                ref={removeButtonRef}
                type="button"
                variant="outline"
                className="w-full cursor-pointer border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive active:opacity-80"
                disabled={disabled || checking || removing}
                onClick={() => {
                  setError('')
                  setOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('removal.remove')}
              </Button>
            )}
            <p className="text-sm leading-6 text-muted-foreground">
              {t('removal.restore-help')}
            </p>
          </div>
        )}
        <ConfirmationDialog
          open={open}
          onOpenChange={setOpen}
          title={t('removal.confirm-title')}
          description={t('removal.confirm-description', {
            name: target?.name || '',
          })}
          cancelLabel={t('removal.cancel')}
          confirmLabel={t('removal.remove')}
          pendingLabel={t('removal.removing')}
          pending={removing}
          error={error}
          onConfirm={removeSite}
          onCloseFocus={() => {
            if (passwordErrorRef.current) onPasswordError()
            else (removeButtonRef.current || inputRef.current)?.focus()
          }}
        >
          <p className="break-all rounded-md bg-muted p-3 font-mono text-sm">
            {target?.url}
          </p>
        </ConfirmationDialog>
      </CardContent>
    </Card>
  )
}
