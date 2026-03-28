'use client';

import { useState } from 'react';

type Category = {
  name: string;
  reasons: string[];
};

const CATEGORIES: Category[] = [
  {
    name: 'Musculoskeletal',
    reasons: [
      'Back Pain',
      'Neck Pain',
      'Shoulder Pain',
      'Knee Pain',
      'Hip Pain',
      'Ankle Sprain',
      'Tennis Elbow',
      'Frozen Shoulder',
      'Sciatica',
      'Plantar Fasciitis',
      'Arthritis',
      'Scoliosis',
      'Carpal Tunnel',
      'Wrist Pain',
      'Foot Pain',
      'Posture Correction',
    ],
  },
  {
    name: 'Neurological',
    reasons: [
      'Stroke Rehab',
      "Parkinson's Disease",
      'Multiple Sclerosis',
      'Cerebral Palsy',
      'Spinal Cord Injury',
      "Bell's Palsy",
      'Vestibular Disorders',
      'Neuropathy',
      'Head Injury Rehab',
      'Balance Disorders',
      'Guillain-Barré',
      'Ataxia',
      'ALS Physio',
      'Spasticity Management',
      'Cognitive Rehab',
      'Gait Training',
    ],
  },
  {
    name: 'Post-Surgery',
    reasons: [
      'Knee Replacement',
      'Hip Replacement',
      'ACL Reconstruction',
      'Rotator Cuff Repair',
      'Spinal Fusion',
      'Shoulder Replacement',
      'Ankle Surgery',
      'Foot Surgery',
      'Carpal Tunnel Release',
      'Disc Surgery',
      'Fracture Rehab',
      'Joint Replacement',
      'Tendon Repair',
      'Ligament Surgery',
      'Amputation Rehab',
      'Scar Management',
    ],
  },
  {
    name: 'Sports Injury',
    reasons: [
      'Muscle Strain',
      'Ligament Sprain',
      'Stress Fracture',
      "Runner's Knee",
      'Shin Splints',
      'Hamstring Tear',
      'Groin Strain',
      'Achilles Tendinopathy',
      "Jumper's Knee",
      'IT Band Syndrome',
      'Rotator Cuff Injury',
      'Sports Concussion',
      'Bursitis',
      'Muscle Cramp',
      'Overuse Injury',
      'Return to Sport',
    ],
  },
];

const CommonReasons = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Musculoskeletal');

  const activeCategoryData = CATEGORIES.find((c) => c.name === activeCategory);

  return (
    <section style={{ backgroundColor: '#FFF0BB', padding: '64px 0' }}>
      <div className="container-bp">
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#333333',
            marginBottom: '24px',
          }}
        >
          Common visit reasons
        </h2>

        {/* Category tabs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          {CATEGORIES.map((category) => {
            const isActive = category.name === activeCategory;
            return (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                style={{
                  backgroundColor: isActive ? '#333333' : '#FFFFFF',
                  border: `1.5px solid ${isActive ? '#333333' : '#CCCCCC'}`,
                  borderRadius: '20px',
                  padding: '8px 20px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: isActive ? '#FFFFFF' : '#333333',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#333333';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#CCCCCC';
                  }
                }}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Reasons grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ gap: '8px 24px' }}
        >
          {activeCategoryData?.reasons.map((reason) => (
            <a
              key={reason}
              href="#"
              style={{
                fontSize: '14px',
                color: '#333333',
                textDecoration: 'none',
                padding: '8px 0',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                display: 'block',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = '#00766C';
                el.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = '#333333';
                el.style.textDecoration = 'none';
              }}
            >
              {reason}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommonReasons;
