'use client';

const JobsCTA = () => {
  return (
    <section style={{ backgroundColor: '#FFF0BB', padding: '80px 0' }}>
      <div
        className="container-bp"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left column */}
        <div style={{ flex: '0 0 60%' }}>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#00766C',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '16px',
            }}
          >
            BookPhysio jobs
          </p>
          <h2
            style={{
              fontSize: '36px',
              lineHeight: '48px',
              fontWeight: 700,
              color: '#333333',
              marginBottom: '32px',
              maxWidth: '480px',
            }}
          >
            Join us, and help transform physiotherapy for everyone.
          </h2>
          <a
            href="#"
            style={{
              backgroundColor: '#00766C',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: '24px',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#005A52';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#00766C';
            }}
          >
            View job openings
          </a>
        </div>

        {/* Right column */}
        <div
          className="hidden md:flex"
          style={{
            flex: '0 0 40%',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '96px',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <span>🧑‍⚕️</span>
            <span>👩‍⚕️</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobsCTA;
