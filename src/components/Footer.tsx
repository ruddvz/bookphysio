import Link from 'next/link';
import type { CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Footer — static site footer with 5-column link grid + legal bar
// Server Component — no 'use client' needed
// ---------------------------------------------------------------------------

const BADGE_STYLE: CSSProperties = {
  background: '#000000',
  color: '#FFFFFF',
  borderRadius: '8px',
  padding: '8px 16px',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
};

interface FooterLink {
  label: string;
  href: string;
  isNew?: boolean;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    heading: 'BookPhysio',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About us', href: '/about' },
      { label: 'Press', href: '/press' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Help', href: '/help' },
    ],
  },
  {
    heading: 'Discover',
    links: [
      { label: 'The Physio Journal', href: '/journal' },
      { label: 'Resources for providers', href: '/resources' },
      { label: 'Community Standards', href: '/community' },
      { label: 'Data and privacy', href: '/privacy' },
      { label: 'Verified reviews', href: '/reviews' },
      { label: 'Tech Blog', href: '/tech-blog', isNew: true },
    ],
  },
  {
    heading: 'Popular Treatments',
    links: [
      { label: 'Back Pain Relief', href: '/treatments/back-pain' },
      { label: 'Post-Surgery Rehab', href: '/treatments/post-surgery' },
      { label: 'Sports Injuries', href: '/treatments/sports-injuries' },
      { label: 'Neck Pain Treatment', href: '/treatments/neck-pain' },
      { label: 'Joint Mobility', href: '/treatments/joint-mobility' },
    ],
  },
  {
    heading: 'Top Specialties',
    links: [
      { label: 'Sports Physio', href: '/specialties/sports' },
      { label: 'Neuro Physio', href: '/specialties/neuro' },
      { label: 'Ortho Physio', href: '/specialties/ortho' },
      { label: 'Paediatric Physio', href: '/specialties/paediatric' },
      { label: "Women's Health", href: '/specialties/womens-health' },
    ],
  },
  {
    heading: 'Are you a provider?',
    links: [
      { label: 'Try our AI scheduler', href: '/providers/ai-scheduler', isNew: true },
      { label: 'List your practice', href: '/providers/list' },
      { label: 'Become an EHR partner', href: '/providers/ehr' },
      { label: 'Developers', href: '/developers' },
      { label: 'Enterprise Solutions', href: '/enterprise' },
      { label: 'Get the BookPhysio app', href: '/app' },
    ],
  },
];

const LEGAL_LINKS = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Consumer Health', href: '/consumer-health' },
  { label: 'Site map', href: '/sitemap' },
  { label: 'Your privacy choices', href: '/privacy-choices' },
];

const SOCIAL_LINKS = [
  { label: '𝕏', href: 'https://twitter.com/bookphysio', title: 'Twitter/X' },
  { label: '📸', href: 'https://instagram.com/bookphysio', title: 'Instagram' },
  { label: 'f', href: 'https://facebook.com/bookphysio', title: 'Facebook' },
  { label: 'in', href: 'https://linkedin.com/company/bookphysio', title: 'LinkedIn' },
];

const LEGAL_TEXT =
  'The content provided here and elsewhere on the BookPhysio.in site or mobile app is provided for general informational purposes only. It is not intended as, and BookPhysio does not provide, medical advice, diagnosis or treatment. Always contact your healthcare provider directly with any questions you may have regarding your condition or specific medical advice.';

function NewBadge() {
  return (
    <span
      style={{
        background: '#FEED5A',
        color: '#333333',
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: '4px',
        marginLeft: '6px',
        display: 'inline',
      }}
    >
      New
    </span>
  );
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#333333', color: '#FFFFFF' }}>
      {/* Main content */}
      <div
        style={{
          maxWidth: '1142px',
          margin: '0 auto',
          padding: '64px 60px',
        }}
      >
        {/* 5-column grid */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '120px repeat(4, 1fr)',
            gap: '48px',
          }}
        >
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: '16px',
                }}
              >
                {col.heading}
              </p>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer-link"
                >
                  {link.label}
                  {link.isNew && <NewBadge />}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* App badges + social row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: '32px',
            marginTop: '48px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* App store badges */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="#" aria-label="Download on the App Store" style={BADGE_STYLE}>
              <span>⬛</span>
              <span>
                Download on the
                <br />
                App Store
              </span>
            </Link>
            <Link href="#" aria-label="Get it on Google Play" style={BADGE_STYLE}>
              <span>▶</span>
              <span>
                Get it on
                <br />
                Google Play
              </span>
            </Link>
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {SOCIAL_LINKS.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                aria-label={s.title}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '18px',
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div
        style={{
          backgroundColor: '#222222',
          padding: '16px 60px',
          fontSize: '12px',
          color: '#999999',
          lineHeight: 1.6,
        }}
      >
        <p style={{ marginBottom: '12px' }}>{LEGAL_TEXT}</p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>© 2026 BookPhysio.in</span>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: '#999999',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social icons in legal bar */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {SOCIAL_LINKS.map((s) => (
              <Link
                key={`legal-${s.title}`}
                href={s.href}
                aria-label={s.title}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '14px',
                  color: '#999999',
                  textDecoration: 'none',
                }}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive styles via a style tag — avoids 'use client' */}
      <style>{`
        .footer-link {
          font-size: 14px;
          color: #CCCCCC;
          text-decoration: none;
          display: block;
          margin-bottom: 12px;
          line-height: 1.4;
          transition: color 0.15s;
        }
        .footer-link:hover {
          color: #FFFFFF;
        }
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
