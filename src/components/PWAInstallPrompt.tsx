'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { Download, Monitor, MoreVertical, Plus, Share, Smartphone, X } from 'lucide-react'

type DashboardRole = 'patient' | 'provider' | 'admin'
type Platform = 'ios' | 'android' | 'desktop'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface RoleConfig {
  label: string
  color: string
  bg: string
  border: string
}

const ROLE_CONFIG: Record<DashboardRole, RoleConfig> = {
  patient: {
    label: 'BookPhysio Patient',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  provider: {
    label: 'BookPhysio Provider',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  admin: {
    label: 'BookPhysio Admin',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  },
}

const DISMISS_KEY_PREFIX = 'bp-pwa-dismissed-'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000
const memoryDismissedAt = new Map<string, string>()

function getIconSrc(role: DashboardRole): string {
  if (role === 'admin') return '/icon-admin-192.png?v=20260411'
  if (role === 'provider') return '/icon-provider-192.png?v=20260411'
  return '/icon-patient-192.png?v=20260411'
}

function detectPlatform(): Platform {
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
    ('standalone' in navigator && (navigator as Record<string, unknown>).standalone === true)
  )
}

function readDismissedAt(dismissKey: string): number | null {
  try {
    const dismissed = localStorage.getItem(dismissKey)
    return dismissed ? Number.parseInt(dismissed, 10) : null
  } catch {
    const dismissed = memoryDismissedAt.get(dismissKey)
    return dismissed ? Number.parseInt(dismissed, 10) : null
  }
}

function writeDismissedAt(dismissKey: string, dismissedAt: string): void {
  try {
    localStorage.setItem(dismissKey, dismissedAt)
  } catch {
    memoryDismissedAt.set(dismissKey, dismissedAt)
  }
}

function getInstallButtonClass(role: DashboardRole): string {
  return role === 'patient' ? 'bg-blue-600' : role === 'provider' ? 'bg-purple-600' : 'bg-gray-800'
}

function InstallBanner({
  role,
  config,
  onDismiss,
  onInstall,
  onOpenTutorial,
}: {
  role: DashboardRole
  config: RoleConfig
  onDismiss: () => void
  onInstall: () => void
  onOpenTutorial: () => void
}) {
  return (
    <div className={`mx-4 mb-4 rounded-2xl border ${config.border} ${config.bg} p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <Image
          src={getIconSrc(role)}
          alt={`${config.label} icon`}
          width={48}
          height={48}
          className="shrink-0 rounded-xl"
          unoptimized
        />
        <div className="min-w-0 flex-1">
          <h3 className={`text-[14px] font-bold ${config.color}`}>
            Install {config.label}
          </h3>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Add to your home screen for quick access, even offline.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onInstall}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 ${getInstallButtonClass(role)}`}
            >
              <Download size={14} />
              Install App
            </button>
            <button
              onClick={onOpenTutorial}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              How to install
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

function PlatformTabs({
  platform,
  setPlatform,
}: {
  platform: Platform
  setPlatform: (platform: Platform) => void
}) {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1">
      {(['android', 'ios', 'desktop'] as const).map((platformOption) => (
        <button
          key={platformOption}
          onClick={() => setPlatform(platformOption)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-bold transition-all ${
            platform === platformOption
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {platformOption === 'desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}
          {platformOption === 'android' ? 'Android' : platformOption === 'ios' ? 'iPhone / iPad' : 'Desktop'}
        </button>
      ))}
    </div>
  )
}

function PlatformInstallInstructions({
  deferredPrompt,
  onInstall,
  platform,
  role,
}: {
  deferredPrompt: BeforeInstallPromptEvent | null
  onInstall: () => void
  platform: Platform
  role: DashboardRole
}) {
  if (platform === 'android') {
    return (
      <div className="space-y-4">
        <p className="text-[13px] text-slate-600">
          Install this app directly from Chrome for a native app experience.
        </p>
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
            description="Confirm the installation when prompted. The app icon will appear on your home screen."
          />
        </div>
        {deferredPrompt ? (
          <button
            onClick={onInstall}
            className={`w-full rounded-xl py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90 ${getInstallButtonClass(role)}`}
          >
            Install Now — Skip the Steps
          </button>
        ) : null}
      </div>
    )
  }

  if (platform === 'ios') {
    return (
      <div className="space-y-4">
        <p className="text-[13px] text-slate-600">
          On iPhone and iPad, use Safari to add this app to your home screen.
        </p>
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
            description='Scroll down in the share menu and tap "Add to Home Screen".'
          />
          <Step
            number={4}
            icon={<Download size={16} />}
            title='Tap "Add"'
            description="Confirm the name and tap Add in the top-right corner. The app will appear on your home screen."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-slate-600">
        Install this app on your computer for quick access from your taskbar or dock.
      </p>
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
          description='Look for the install icon (⊕) in the address bar, or go to Menu → "Install app".'
        />
        <Step
          number={3}
          icon={<Plus size={16} />}
          title='Click "Install"'
          description="Confirm the installation. The app will open in its own window and appear in your Start menu or Applications."
        />
      </div>
      {deferredPrompt ? (
        <button
          onClick={onInstall}
          className={`w-full rounded-xl py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90 ${getInstallButtonClass(role)}`}
        >
          Install Now — Skip the Steps
        </button>
      ) : null}
    </div>
  )
}

function InstallTutorialModal({
  config,
  deferredPrompt,
  onClose,
  onInstall,
  platform,
  role,
  setPlatform,
}: {
  config: RoleConfig
  deferredPrompt: BeforeInstallPromptEvent | null
  onClose: () => void
  onInstall: () => void
  platform: Platform
  role: DashboardRole
  setPlatform: (platform: Platform) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className={`sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b ${config.border} ${config.bg} px-5 py-4`}>
          <div className="flex items-center gap-3">
            <Image src={getIconSrc(role)} alt="" width={32} height={32} className="rounded-lg" unoptimized />
            <h2 className={`text-[16px] font-bold ${config.color}`}>
              Install {config.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <PlatformTabs platform={platform} setPlatform={setPlatform} />
          <PlatformInstallInstructions
            deferredPrompt={deferredPrompt}
            onInstall={onInstall}
            platform={platform}
            role={role}
          />

          <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-slate-400">
              Why install?
            </h4>
            <div className="space-y-2">
              {[
                'Launch instantly from your home screen',
                'Works offline — view cached data anytime',
                'Full-screen experience without browser UI',
                'Faster load times with cached resources',
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 text-[12px] text-slate-600">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PWAInstallPrompt({ role }: { role: DashboardRole }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [platform, setPlatform] = useState<Platform>(() => detectPlatform())
  const dismissKey = `${DISMISS_KEY_PREFIX}${role}`
  const config = ROLE_CONFIG[role]

  useEffect(() => {
    if (isStandalone()) return

    const dismissedAt = readDismissedAt(dismissKey)
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DURATION_MS) {
      return
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
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
  }, [dismissKey])

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
      }
      setDeferredPrompt(null)
      return
    }

    setShowTutorial(true)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowBanner(false)
    writeDismissedAt(dismissKey, String(Date.now()))
  }, [dismissKey])

  if (!showBanner || isStandalone()) return null

  return (
    <>
      <InstallBanner
        role={role}
        config={config}
        onDismiss={handleDismiss}
        onInstall={handleInstall}
        onOpenTutorial={() => setShowTutorial(true)}
      />
      {showTutorial ? (
        <InstallTutorialModal
          config={config}
          deferredPrompt={deferredPrompt}
          onClose={() => setShowTutorial(false)}
          onInstall={handleInstall}
          platform={platform}
          role={role}
          setPlatform={setPlatform}
        />
      ) : null}
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-500">
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
