import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingCard from './BookingCard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VisitType = 'in_clinic' | 'home_visit' | 'online'

interface Education {
  degree: string
  institution: string
  year: number
}

interface Review {
  name: string
  rating: number
  date: string
  text: string
}

interface Doctor {
  id: string
  name: string
  credentials: string
  specialty: string
  rating: number
  reviewCount: number
  location: string
  icpNumber: string
  icpVerified: boolean
  fee: Record<VisitType, number>
  visitTypes: readonly VisitType[]
  bio: string
  specializations: string[]
  education: Education[]
  languages: string[]
  reviews: Review[]
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_DOCTOR: Doctor = {
  id: '1',
  name: 'Dr. Priya Sharma',
  credentials: 'BPT, MPT (Sports)',
  specialty: 'Sports Physiotherapist',
  rating: 4.9,
  reviewCount: 187,
  location: 'Andheri West, Mumbai',
  icpNumber: 'ICP-MH-2017-04821',
  icpVerified: true,
  fee: { in_clinic: 700, home_visit: 900, online: 600 },
  visitTypes: ['in_clinic', 'home_visit', 'online'] as const,
  bio: 'Dr. Priya Sharma is a highly experienced Sports Physiotherapist with over 8 years of clinical practice. She specialises in sports injury rehabilitation, musculoskeletal pain, and post-surgical recovery, helping athletes and active individuals return to peak performance.',
  specializations: ['Back Pain', 'Sports Injuries', 'Post-Surgery Rehab', 'Knee Pain', 'Shoulder Pain'],
  education: [
    { degree: 'BPT', institution: 'KMC Manipal', year: 2015 },
    { degree: 'MPT (Sports)', institution: 'NIMHANS Bangalore', year: 2017 },
  ],
  languages: ['English', 'Hindi', 'Marathi'],
  reviews: [
    {
      name: 'Rahul M.',
      rating: 5,
      date: '15 Mar 2026',
      text: 'Excellent treatment. My knee pain is completely gone after 6 sessions.',
    },
    {
      name: 'Priya K.',
      rating: 5,
      date: '2 Mar 2026',
      text: 'Very professional and knowledgeable. Highly recommend for sports injuries.',
    },
    {
      name: 'Amit S.',
      rating: 4,
      date: '20 Feb 2026',
      text: 'Good experience overall. The home visit option was very convenient.',
    },
  ],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5
  return (
    <span aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < fullStars) return <span key={i} style={{ color: '#F5A623' }}>★</span>
        if (i === fullStars && hasHalf) return <span key={i} style={{ color: '#F5A623' }}>½</span>
        return <span key={i} style={{ color: '#DDDDDD' }}>★</span>
      })}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page component (Server Component — no 'use client')
// ---------------------------------------------------------------------------

interface DoctorPageProps {
  params: Promise<{ id: string }>
}

export default async function DoctorPage({ params }: DoctorPageProps) {
  // In future: fetch real doctor by (await params).id
  const doctor = MOCK_DOCTOR

  return (
    <>
      <Navbar />

      <main
        style={{
          backgroundColor: '#F7F8F9',
          minHeight: '100vh',
          paddingTop: '40px',
          paddingBottom: '80px',
        }}
      >
        <div
          style={{
            maxWidth: '1142px',
            margin: '0 auto',
            padding: '0 60px',
          }}
          className="doctor-page-container"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '65% 35%',
              gap: '32px',
              alignItems: 'start',
            }}
            className="doctor-page-grid"
          >
            {/* ----------------------------------------------------------------
                LEFT COLUMN
            ---------------------------------------------------------------- */}
            <div>
              {/* ---- 1. Hero row ---- */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E5E5',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      backgroundColor: '#00766C',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    {doctor.name
                      .split(' ')
                      .slice(1, 3)
                      .map((w) => w[0])
                      .join('')}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h1
                      style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#333333',
                        margin: '0 0 4px',
                      }}
                    >
                      {doctor.name}
                    </h1>

                    <p
                      style={{
                        fontSize: '14px',
                        color: '#666666',
                        margin: '0 0 4px',
                      }}
                    >
                      {doctor.credentials}
                    </p>

                    <p
                      style={{
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#00766C',
                        margin: '0 0 12px',
                      }}
                    >
                      {doctor.specialty}
                    </p>

                    {/* Rating + ICP badge row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                        marginBottom: '10px',
                      }}
                    >
                      {/* Stars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <StarRating rating={doctor.rating} />
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#333333',
                            marginLeft: '4px',
                          }}
                        >
                          {doctor.rating}
                        </span>
                        <span style={{ fontSize: '14px', color: '#666666' }}>
                          ({doctor.reviewCount} reviews)
                        </span>
                      </div>

                      {/* ICP Verified badge */}
                      {doctor.icpVerified && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#E6F4F3',
                            color: '#005A52',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '24px',
                          }}
                        >
                          <span aria-hidden="true">✓</span> ICP Verified
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px',
                        color: '#666666',
                      }}
                    >
                      <span aria-hidden="true">📍</span>
                      {doctor.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- 2. About ---- */}
              <section
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E5E5',
                  padding: '24px',
                  marginBottom: '24px',
                }}
                aria-labelledby="about-heading"
              >
                <h2
                  id="about-heading"
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#333333',
                    margin: '0 0 12px',
                  }}
                >
                  About
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    color: '#555555',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {doctor.bio}
                </p>
              </section>

              {/* ---- 3. Specializations ---- */}
              <section
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E5E5',
                  padding: '24px',
                  marginBottom: '24px',
                }}
                aria-labelledby="specializations-heading"
              >
                <h2
                  id="specializations-heading"
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#333333',
                    margin: '0 0 16px',
                  }}
                >
                  Specializations
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {doctor.specializations.map((spec) => (
                    <span
                      key={spec}
                      style={{
                        backgroundColor: '#F5F5F5',
                        color: '#333333',
                        fontSize: '13px',
                        fontWeight: 500,
                        padding: '6px 14px',
                        borderRadius: '8px',
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </section>

              {/* ---- 4. Education ---- */}
              <section
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E5E5',
                  padding: '24px',
                  marginBottom: '24px',
                }}
                aria-labelledby="education-heading"
              >
                <h2
                  id="education-heading"
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#333333',
                    margin: '0 0 16px',
                  }}
                >
                  Education
                </h2>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {doctor.education.map((edu) => (
                    <li
                      key={`${edu.degree}-${edu.year}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #F5F5F5',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#E6F4F3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '16px',
                        }}
                        aria-hidden="true"
                      >
                        🎓
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#333333',
                            margin: '0 0 2px',
                          }}
                        >
                          {edu.degree}
                        </p>
                        <p
                          style={{
                            fontSize: '13px',
                            color: '#666666',
                            margin: 0,
                          }}
                        >
                          {edu.institution} · {edu.year}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* ---- 5. ICP & Languages ---- */}
              <section
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E5E5',
                  padding: '24px',
                  marginBottom: '24px',
                }}
                aria-labelledby="credentials-heading"
              >
                <h2
                  id="credentials-heading"
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#333333',
                    margin: '0 0 16px',
                  }}
                >
                  Credentials &amp; Languages
                </h2>

                {/* ICP */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#00766C',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: '14px', color: '#333333' }}>
                    <strong>ICP Registration:</strong> {doctor.icpNumber}
                  </span>
                </div>

                {/* Languages */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{ fontSize: '16px', flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    🗣️
                  </span>
                  <span style={{ fontSize: '14px', color: '#333333' }}>
                    <strong>Languages:</strong>{' '}
                    {doctor.languages.join(', ')}
                  </span>
                </div>
              </section>

              {/* ---- 6. Reviews ---- */}
              <section
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E5E5',
                  padding: '24px',
                }}
                aria-labelledby="reviews-heading"
              >
                <h2
                  id="reviews-heading"
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#333333',
                    margin: '0 0 20px',
                  }}
                >
                  Patient Reviews
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {doctor.reviews.map((review, idx) => (
                    <article
                      key={idx}
                      style={{
                        padding: '16px',
                        backgroundColor: '#F7F8F9',
                        borderRadius: '8px',
                        border: '1px solid #E5E5E5',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px',
                          flexWrap: 'wrap',
                          gap: '4px',
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#333333',
                            }}
                          >
                            {review.name}
                          </span>
                          <span style={{ marginLeft: '8px' }}>
                            <StarRating rating={review.rating} />
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#999999',
                          }}
                        >
                          {review.date}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#555555',
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {review.text}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            {/* ----------------------------------------------------------------
                RIGHT COLUMN — Booking card (sticky)
            ---------------------------------------------------------------- */}
            <aside aria-label="Book a session">
              <BookingCard
                doctorId={doctor.id}
                fee={doctor.fee}
                visitTypes={doctor.visitTypes}
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* Responsive overrides — avoids 'use client' */}
      <style>{`
        @media (max-width: 1024px) {
          .doctor-page-container {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
        }
        @media (max-width: 768px) {
          .doctor-page-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
