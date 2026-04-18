export const FAQS = [
  {
    category: 'Booking a session',
    items: [
      {
        question: 'How do I book a physiotherapist?',
        answer:
          'Search by your city, condition or specialty, open a provider you like, pick a date and time that suits you, and tap Book Session. You will get an OTP on your mobile to confirm, and a confirmation message once the provider accepts.',
      },
      {
        question: 'What does IAP Verified mean?',
        answer:
          'It means the physiotherapist has shared a valid registration number with either the Indian Association of Physiotherapists or a recognised State Council, and we have checked that it matches the name on their profile. You can see a verified badge on the provider card when we have confirmed this.',
      },
      {
        question: 'Can I book a home visit?',
        answer:
          'Yes. Many physiotherapists on BookPhysio offer home visits alongside their clinic work. Use the Home Visit filter on the search page to see only providers who visit patients at home, along with their home-visit fee and travel area.',
      },
      {
        question: 'Is BookPhysio available in my city?',
        answer:
          'We are growing city by city. If a provider is listed in your pincode area, you can book them right away. If you cannot find anyone near you, you can still create an account and we will notify you when a verified physiotherapist joins in your area.',
      },
      {
        question: 'Do I need a doctor\u2019s prescription to book?',
        answer:
          'No. You can book a physiotherapy session directly. If you have an existing prescription or report from a doctor, you can share it with the provider at the start of the session to help them plan your care.',
      },
    ],
  },
  {
    category: 'Payments and refunds',
    items: [
      {
        question: 'How do I pay for my session?',
        answer:
          'Most bookings are paid online through Razorpay using UPI, credit or debit cards, or net banking. If a provider has enabled pay-at-visit, that option is shown clearly before you confirm, and you pay the provider directly at the session.',
      },
      {
        question: 'Will I get a GST invoice?',
        answer:
          'Yes. Every online payment through BookPhysio generates a GST-compliant invoice, which you can download from your Patient Dashboard once the booking is confirmed.',
      },
      {
        question: 'What is your cancellation and refund policy?',
        answer:
          'You can cancel or reschedule free of charge up to four hours before the session from your Patient Dashboard. Cancellations inside the four-hour window, or no-shows, may be charged in full. If the provider cancels, or if the session cannot take place for a reason attributable to them or to us, you get a full refund to the original payment method, usually within five to seven working days.',
      },
      {
        question: 'What if I am not satisfied with a session?',
        answer:
          'Write to us at support@bookphysio.in within seven days of the session. Share the booking reference and a short description of what went wrong. We will investigate with the provider and come back to you with an outcome, including a refund where we believe it is fair.',
      },
    ],
  },
  {
    category: 'Safety and privacy',
    items: [
      {
        question: 'Is my personal and health information safe?',
        answer:
          'We collect only what we need to run your booking, and we never sell your personal or health data. Data is encrypted in transit, access to our database is tightly controlled, and payments are handled by Razorpay so card details never touch our servers. Full details are in our Privacy Policy.',
      },
      {
        question: 'How do I report a problem with a provider or the site?',
        answer:
          'For general issues write to support@bookphysio.in. For privacy or content-related grievances under Indian law you can write directly to our Grievance Officer at grievance@bookphysio.in. We aim to acknowledge grievances within forty-eight hours.',
      },
      {
        question: 'Is BookPhysio suitable for emergencies?',
        answer:
          'No. BookPhysio is for planned physiotherapy sessions, not urgent or emergency care. If you are having a medical emergency, please call your local emergency number or go to the nearest hospital.',
      },
    ],
  },
  {
    category: 'For physiotherapists',
    items: [
      {
        question: 'How do I list my practice on BookPhysio?',
        answer:
          'Tap For Providers in the top navigation and start the signup flow. You will be asked for your name, mobile number, IAP or State Council registration number and basic practice details. Our team reviews each application before the profile goes live.',
      },
      {
        question: 'Does it cost anything to list?',
        answer:
          'Creating and maintaining a profile is free. We charge a small platform fee only on bookings that are paid online through BookPhysio, so you only pay when you actually earn through the platform.',
      },
      {
        question: 'What does the provider dashboard give me?',
        answer:
          'Your dashboard lets you manage your calendar and availability, see upcoming and past appointments, keep simple notes for each patient, track earnings and payouts, and generate GST-ready bills for pay-at-visit sessions.',
      },
      {
        question: 'Who controls my patient records?',
        answer:
          'Any clinical notes or records you add belong to you and your patient. BookPhysio stores them securely on your behalf so you can access them from your dashboard, but we do not share them with anyone else without a lawful reason.',
      },
    ],
  },
] as const

export function categoryAnchorId(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-')
}
