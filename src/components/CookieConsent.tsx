"use client"

import { useState, useEffect } from "react"

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true)
    }
  }, [])

  if (!show) return null

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    window.dispatchEvent(new Event("cookie-consent-changed"))
    setShow(false)
  }

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected")
    window.dispatchEvent(new Event("cookie-consent-changed"))
    setShow(false)
  }

  return (
    <div className="fixed bottom-8 left-8 right-8 z-[100] md:left-auto md:max-w-md animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-white rounded-[var(--sq-lg)] border border-bp-border p-6 shadow-2xl shadow-bp-primary/10">
        <div className="flex flex-col gap-4">
          <p className="text-[14px] leading-relaxed text-bp-body font-medium">
            We use essential cookies for clinical security and performance.
            By clicking &ldquo;Accept&rdquo;, you agree to our verification protocols.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-[#6B7BF5] text-white py-3 rounded-[var(--sq-sm)] text-[14px] font-bold hover:bg-[#5363D7] transition-all active:scale-[0.98]"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="px-6 py-3 border border-bp-border rounded-[var(--sq-sm)] text-[14px] font-bold text-bp-body/60 hover:bg-bp-surface transition-all active:scale-[0.98]"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
