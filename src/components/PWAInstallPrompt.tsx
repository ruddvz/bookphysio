'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  X,
  Share,
  Plus,
  MoreVertical,
  Download,
  Smartphone,
  Monitor,
  Zap,
  Wifi,
  Layout,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

type DashboardRole = 'patient' | 'provider' | 'admin'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const ROLE_CONFIG: Record<
  DashboardRole,
  { label: string; accent: string; accentLight: string; accentText: string }
> = {
  patient: {
    label: 'BookPhysio Patient',
    accent: 'bg-blue-600',
    accentLight: 'bg-blue-50',
    accentText: 'text-blue-700',
  },
  provider: {
    label: 'BookPhysio Provider',
    accent: 'bg-purple-600',
    accentLight: 'bg-purple-50',
    accentText: 'text-purple-700',
  },
  admin: {
    label: 'BookPhysio Admin',
    accent: 'bg-gray-800',
    accentLight: 'bg-gray-50',
    accentText: 'text-gray-700',
  },
}

const DISMISS_KEY_PREFIX = 'bp-pwa-dismissed-'

function getIconSrc(role: DashboardRole): string {
  if (role === 'admin') return '/icon-admin-192.png?v=20260411'
  if (role === 'provider') return '/icon-provider-192.png?v=20260411'
  return '/icon-patient-192.png?v=20260411'
}

function detectPlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as Record<string, unknown>).standalone === true)
  )
}

const WHY_INSTALL_ITEMS = [
  {
    icon: Zap,
    title: 'Instant access',
    description: 'Launch from your home screen — no browser needed',
  },
  {
    icon: Wifi,
    title: 'Works offline',
    description: 'View cached data even without an internet connection',
  },
  {
    icon: Layout,
    title: 'Full-screen experience',
    description: 'Enjoy the app without browser UI distractions',
  },
  {
    icon: Clock,
    title: 'Faster load times',
    description: 'Cached resources mean snappier performance',
  },
]

export function PWAInstallPrompt({ role }: { role: DashboardRole }) {
  const { user } = useAuth()
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>(() =>
    detectPlatform()
  )

  const dismissKey = `${DISMISS_KEY_PREFIX}${role}`

  useEffect(() => {
    // Only show PWA prompt when logged in
    if (!user) return
    if (isStandalone()) return

    try {
      const dismissed = localStorage.getItem(dismissKey)
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10)
        if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return
      }
    } catch {
      // localStorage may be unavailable
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    const timer = setTimeout(() => {
      setShowBanner(true)
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(timer)
    }
  }, [dismissKey, user])

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
      }
      setDeferredPrompt(null)
    } else {
      setShowTutorial(true)
    }
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowBanner(false)
    try {
      localStorage.setItem(dismissKey, String(Date.now()))
    } catch {
      // localStorage may be unavailable
    }
  }, [dismissKey])

  const config = ROLE_CONFIG[role]

  if (!showBanner || isStandalone() || !user) return null

  return (
    <>
      {/* Compact install banner */}
      <div className="mx-4 mb-4 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src={getIconSrc(role)}
            alt={`${config.label} icon`}
            width={40}
            height={40}
            className="shrink-0 rounded-xl"
            unoptimized
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800 leading-tight">
              Install App
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Add to your home screen for<br />quick access
            </p>
          </div>
          <button
            onClick={handleInstall}
            className={`shrink-0 rounded-xl px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 ${config.accent}`}
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-full p-1 text-slate-300 hover:text-slate-500 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Install tutorial modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowTutorial(false)}
          />
          <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <Image
                  src={getIconSrc(role)}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-lg"
                  unoptimized
                />
                <h2 className="text-[16px] font-bold text-slate-800">
                  Install {config.label}
                </h2>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Why install section — redesigned as icon cards */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Why install?
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {WHY_INSTALL_ITEMS.map(({ icon: Icon, title, description }) => (
                    <div
                      key={title}
                      className={`rounded-xl border border-slate-100 p-3 ${config.accentLight}`}
                    >
                      <Icon size={18} className={`${config.accentText} mb-2`} />
                      <p className="text-[12px] font-bold text-slate-800 leading-tight">
                        {title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform tabs */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  How to install
                </h3>
                <div className="flex rounded-xl bg-slate-100 p-1">
                  {(['android', 'ios', 'desktop'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-bold transition-all ${
                        platform === p
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {p === 'android' && <Smartphone size={14} />}
                      {p === 'ios' && <Smartphone size={14} />}
                      {p === 'desktop' && <Monitor size={14} />}
                      {p === 'android'
                        ? 'Android'
                        : p === 'ios'
                          ? 'iPhone / iPad'
                          : 'Desktop'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform instructions */}
              {platform === 'android' && (
                <div className="space-y-3">
                  <Step
                    number={1}
                    icon={<MoreVertical size={16} />}
                    title="Open browser menu"
                    description="Tap the three-dot menu (⋮) in the top-right corner of Chrome."
                  />
                  <Step
                    number={2}
                    icon={<Plus size={16} />}
                    title='Tap "Add to Home screen"'
                    description='Scroll down and tap "Add to Home screen" or "Install app".'
                  />
                  <Step
                    number={3}
                    icon={<Download size={16} />}
                    title='Tap "Install"'
                    description="Confirm the installation. The app icon will appear on your home screen."
                  />
                  {deferredPrompt && (
                    <button
                      onClick={handleInstall}
                      className={`w-full rounded-xl py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90 ${config.accent}`}
                    >
                      Install Now — Skip the Steps
                    </button>
                  )}
                </div>
              )}

              {platform === 'ios' && (
                <div className="space-y-3">
                  <Step
                    number={1}
                    icon={<Share size={16} />}
                    title="Open in Safari"
                    description="Make sure you're using Safari (not Chrome or other browsers)."
                  />
                  <Step
                    number={2}
                    icon={<Share size={16} />}
                    title="Tap the Share button"
                    description="Tap the share icon (square with arrow) at the bottom of the screen."
                  />
                  <Step
                    number={3}
                    icon={<Plus size={16} />}
                    title='"Add to Home Screen"'
                    description='Scroll down and tap "Add to Home Screen".'
                  />
                  <Step
                    number={4}
                    icon={<Download size={16} />}
                    title='Tap "Add"'
                    description="Confirm the name and tap Add. The app will appear on your home screen."
                  />
                </div>
              )}

              {platform === 'desktop' && (
                <div className="space-y-3">
                  <Step
                    number={1}
                    icon={<Monitor size={16} />}
                    title="Use Chrome or Edge"
                    description="Open this page in Google Chrome or Microsoft Edge."
                  />
                  <Step
                    number={2}
                    icon={<Download size={16} />}
                    title="Click the install icon"
                    description='Look for the install icon (⊕) in the address bar, or Menu → "Install app".'
                  />
                  <Step
                    number={3}
                    icon={<Plus size={16} />}
                    title='Click "Install"'
                    description="Confirm the installation. The app will open in its own window."
                  />
                  {deferredPrompt && (
                    <button
                      onClick={handleInstall}
                      className={`w-full rounded-xl py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90 ${config.accent}`}
                    >
                      Install Now — Skip the Steps
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-500">
        {number}
      </div>
      <div className="pt-0.5">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800">
          {icon}
          {title}
        </div>
        <p className="mt-0.5 text-[12px] text-slate-500">{description}</p>
      </div>
    </div>
  )
}
