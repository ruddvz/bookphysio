'use client'

import { useEffect } from 'react'

export function DocumentLangSync({ lang }: { lang: 'en' | 'hi' }) {
  useEffect(() => {
    const previousLang = document.documentElement.lang
    document.documentElement.lang = lang

    return () => {
      document.documentElement.lang = previousLang || 'en'
    }
  }, [lang])

  return null
}