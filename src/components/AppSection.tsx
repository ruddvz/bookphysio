import Link from 'next/link';

// ---------------------------------------------------------------------------
// AppSection — static marketing section with QR code + app store badges
// Server Component — no 'use client' needed
// ---------------------------------------------------------------------------

export default function AppSection() {
  return (
    <section
      style={{ backgroundColor: '#FFC794', padding: '80px 0', overflow: 'hidden' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '48px',
          maxWidth: '1142px',
          margin: '0 auto',
          padding: '0 60px',
        }}
      >
        {/* LEFT */}
        <div style={{ flex: '0 0 45%' }}>
          <h2
            style={{
              fontSize: '36px',
              lineHeight: '48px',
              fontWeight: 700,
              color: '#333333',
              marginBottom: '16px',
            }}
          >
            Thousands of physios. One app.
          </h2>

          <p
            style={{
              fontSize: '16px',
              lineHeight: '26px',
              color: '#333333',
              marginBottom: '32px',
            }}
          >
            The bookphysio app is the quickest, easiest way to book and keep
            track of your physiotherapy appointments.
          </p>

          <p
            style={{
              fontSize: '14px',
              color: '#333333',
              marginBottom: '12px',
            }}
          >
            Scan the QR code to get the app now
          </p>

          {/* QR placeholder */}
          <div
            style={{
              width: '102px',
              height: '102px',
              borderRadius: '8px',
              border: '2px solid #FFFFFF',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#666666',
              textAlign: 'center',
              marginBottom: '24px',
              whiteSpace: 'pre-line',
            }}
          >
            {'QR\nCode'}
          </div>

          {/* App badges */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="#" aria-label="Download on the App Store">
              <div
                style={{
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
                }}
              >
                <span>⬛</span>
                <span>
                  Download on the
                  <br />
                  App Store
                </span>
              </div>
            </Link>

            <Link href="#" aria-label="Get it on Google Play">
              <div
                style={{
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
                }}
              >
                <span>▶</span>
                <span>
                  Get it on
                  <br />
                  Google Play
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            flex: '0 0 55%',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            minHeight: '400px',
          }}
        >
          {/* Yellow circle */}
          <div
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              background: '#FEED5A',
              borderRadius: '50%',
              bottom: '-80px',
              right: '-40px',
              zIndex: 0,
            }}
          />

          {/* Phone placeholder */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '240px',
              height: '480px',
              background: '#FFFFFF',
              borderRadius: '32px',
              border: '3px solid #333333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#666666',
              textAlign: 'center',
            }}
          >
            App Screenshot
          </div>
        </div>
      </div>
    </section>
  );
}
