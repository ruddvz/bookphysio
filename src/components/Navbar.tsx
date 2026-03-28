'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

const SPECIALTIES = [
  'Sports Physio',
  'Neuro Physio',
  'Ortho Physio',
  'Paediatric Physio',
  "Women's Health",
  'Geriatric Physio',
]

export default function Navbar() {
  const [browseOpen, setBrowseOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setBrowseOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        height: '80px',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          maxWidth: '1142px',
          margin: '0 auto',
          padding: '0 60px',
          height: '80px',
        }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center shrink-0" aria-label="bookphysio home">
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#00766C',
              color: '#FFFFFF',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            B
          </span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#333333',
              marginLeft: '8px',
            }}
          >
            bookphysio
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center" aria-label="Main navigation">
          {/* Browse dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setBrowseOpen((prev) => !prev)}
              aria-expanded={browseOpen}
              aria-haspopup="true"
              className={cn(
                'flex items-center gap-1 transition-colors duration-150',
                browseOpen ? 'text-[#00766C] underline' : 'hover:text-[#00766C] hover:underline'
              )}
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: browseOpen ? '#00766C' : '#333333',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Browse
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                style={{
                  transform: browseOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s',
                }}
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {browseOpen && (
              <div
                className="absolute left-0 top-full"
                style={{
                  marginTop: '4px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  minWidth: '200px',
                  zIndex: 100,
                }}
                role="menu"
              >
                {SPECIALTIES.map((specialty) => (
                  <a
                    key={specialty}
                    href={`/search?specialty=${encodeURIComponent(specialty)}`}
                    role="menuitem"
                    className="block transition-colors duration-150 hover:text-[#00766C] hover:bg-[#E6F4F3]"
                    style={{
                      fontSize: '15px',
                      fontWeight: 400,
                      color: '#333333',
                      padding: '10px 16px',
                    }}
                    onClick={() => setBrowseOpen(false)}
                  >
                    {specialty}
                  </a>
                ))}
              </div>
            )}
          </div>

          <NavLink href="/help">Help</NavLink>

          <NavLink href="/list-practice" className="hidden lg:inline-flex">
            List your practice on bookphysio
          </NavLink>
        </nav>

        {/* Desktop Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="/login"
            className="flex items-center gap-1 transition-colors duration-150 hover:text-[#00766C]"
            style={{
              fontSize: '16px',
              fontWeight: 500,
              color: '#333333',
              background: 'transparent',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            Log in
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <a
            href="/signup"
            className="transition-colors duration-150"
            style={{
              backgroundColor: '#00766C',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              padding: '10px 20px',
              borderRadius: '24px',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              lineHeight: 1.5,
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#005A52'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#00766C'
            }}
          >
            Sign up
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#333333',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>
    </header>
  )
}

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

function NavLink({ href, children, className }: NavLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'transition-colors duration-150 hover:text-[#00766C] hover:underline',
        className
      )}
      style={{
        fontSize: '16px',
        fontWeight: 500,
        color: '#333333',
        padding: '8px 12px',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {children}
    </a>
  )
}
