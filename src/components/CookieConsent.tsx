"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4 shadow-lg sm:p-6">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          We use cookies to improve your experience, handle secure logins, and analyze site traffic. By continuing to use our site, you agree to our use of cookies.
        </p>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReject}>
            Decline Non-Essential
          </Button>
          <Button size="sm" onClick={handleAccept} className="bg-bp-primary text-white hover:bg-bp-primary/90">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}
