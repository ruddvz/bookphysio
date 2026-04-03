'use client';

import { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CityData {
  name: string;
  specialties: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CITIES: CityData[] = [
  {
    name: 'Mumbai',
    specialties: [
      'Sports Physio',
      'Neuro Physio',
      'Ortho Physio',
      'Home Visit',
      'Paediatric Physio',
      "Women's Health",
    ],
  },
  {
    name: 'Delhi',
    specialties: [
      'Sports Physio',
      'Neuro Physio',
      'Ortho Physio',
      'Home Visit',
      'Geriatric Physio',
      "Women's Health",
    ],
  },
  {
    name: 'Bengaluru',
    specialties: [
      'Sports Physio',
      'Ortho Physio',
      'Neuro Physio',
      'Home Visit',
      'Paediatric Physio',
      "Women's Health",
    ],
  },
  {
    name: 'Hyderabad',
    specialties: [
      'Sports Physio',
      'Ortho Physio',
      'Neuro Physio',
      'Home Visit',
      "Women's Health",
      'Geriatric Physio',
    ],
  },
  {
    name: 'Chennai',
    specialties: [
      'Sports Physio',
      'Ortho Physio',
      'Neuro Physio',
      "Women's Health",
      'Home Visit',
      'Geriatric Physio',
    ],
  },
  {
    name: 'Pune',
    specialties: [
      'Sports Physio',
      'Ortho Physio',
      'Home Visit',
      "Women's Health",
      'Neuro Physio',
      'Paediatric Physio',
    ],
  },
  {
    name: 'Kolkata',
    specialties: [
      'Sports Physio',
      'Neuro Physio',
      'Ortho Physio',
      'Home Visit',
      "Women's Health",
      'Geriatric Physio',
    ],
  },
  {
    name: 'Ahmedabad',
    specialties: [
      'Sports Physio',
      'Ortho Physio',
      'Home Visit',
      "Women's Health",
      'Neuro Physio',
      'Geriatric Physio',
    ],
  },
  {
    name: 'Jaipur',
    specialties: [
      'Sports Physio',
      'Ortho Physio',
      'Home Visit',
      'Neuro Physio',
      "Women's Health",
      'Geriatric Physio',
    ],
  },
  {
    name: 'Kochi',
    specialties: [
      'Sports Physio',
      'Ortho Physio',
      'Neuro Physio',
      'Home Visit',
      "Women's Health",
      'Paediatric Physio',
    ],
  },
  {
    name: 'Chandigarh',
    specialties: [
      'Sports Physio',
      'Ortho Physio',
      'Home Visit',
      'Neuro Physio',
      'Geriatric Physio',
      "Women's Health",
    ],
  },
  {
    name: 'Surat',
    specialties: [
      'Sports Physio',
      'Ortho Physio',
      'Home Visit',
      "Women's Health",
      'Neuro Physio',
      'Geriatric Physio',
    ],
  },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  section: {
    backgroundColor: '#FFF0BB',
    padding: '64px 0',
    width: '100%',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 600,
    color: 'var(--color-bp-primary)',
    marginBottom: '32px',
  },
  citiesGrid: {
    display: 'grid',
    gap: '8px 24px',
  },
  accordionButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(0,0,0,0.12)',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--color-bp-primary)',
    textAlign: 'left',
  },
  expandedContent: {
    padding: '8px 0 12px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  specialtyLink: {
    fontSize: '14px',
    color: 'var(--color-bp-body)',
    textDecoration: 'none',
    lineHeight: 1.4,
    transition: 'color 0.15s ease',
  },
} as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface CityAccordionProps {
  city: CityData;
  isOpen: boolean;
  onToggle: (cityName: string) => void;
}

function CityAccordion({ city, isOpen, onToggle }: CityAccordionProps) {
  return (
    <div>
      <button
        style={styles.accordionButton}
        onClick={() => onToggle(city.name)}
        aria-expanded={isOpen}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#00766C';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#333333';
        }}
      >
        <span>{city.name}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            color: 'var(--color-bp-body)',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div style={styles.expandedContent}>
          {city.specialties.map((specialty) => (
            <a
              key={specialty}
              href="#"
              style={styles.specialtyLink}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.color = '#00766C';
                target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.color = '#666666';
                target.style.textDecoration = 'none';
              }}
            >
              {specialty} in {city.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CityLinks() {
  const [openCity, setOpenCity] = useState<string | null>(null);

  const handleToggle = (cityName: string): void => {
    setOpenCity((prev) => (prev === cityName ? null : cityName));
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Find physiotherapists by city</h2>

        {/* Responsive grid: 4-col desktop, 2-col tablet, 1-col mobile */}
        <div
          style={styles.citiesGrid}
          className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        >
          {CITIES.map((city) => (
            <CityAccordion
              key={city.name}
              city={city}
              isOpen={openCity === city.name}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
