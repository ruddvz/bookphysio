import type { StaticLocale } from './static-pages'

export type { StaticLocale }

// ─── Search Page ─────────────────────────────────────────────────────────────

export const SEARCH_COPY = {
  en: {
    breadcrumbRoot: 'Find Physios',
    headingLoading: 'Sourcing Top Experts',
    headingResults: (total: number) => `${total} Top Experts Found`,
    headingEmpty: 'Search Results',
    subheading: (location: string) =>
      `Verified physiotherapy clinic & home-visit experts available in ${location}.`,
    citiesLabel: 'Cities',
    emptyTitle: 'No exact matches found',
    emptyDescription: (location: string) =>
      `We couldn't locate any verified physios matching your criteria in ${location}. Here is a preview of how BookPhysio surfaces nearby care.`,
    errorTitle: 'Search sync unavailable',
    errorBody:
      'Live results could not be loaded just now, but the demo preview below still shows the intended result flow.',
    errorBodyRetrying:
      'Showing the latest available provider results while we retry the live search.',
    retrySearch: 'Retry search',
    clearFilters: 'Clear All Filters',
    verifiedProfessionals: 'Verified Professionals',
    safetyVerified: 'Safety Verified',
    closingQuote:
      '"Connecting with the right therapist is the first step towards pain-free living."',
    demoPreview: 'Demo preview',
    demoPreviewNote: 'These cards show how live results will look once providers match.',
  },
  hi: {
    breadcrumbRoot: 'फिजियो खोजें',
    headingLoading: 'शीर्ष विशेषज्ञ खोजे जा रहे हैं',
    headingResults: (total: number) => `${total} शीर्ष विशेषज्ञ मिले`,
    headingEmpty: 'खोज परिणाम',
    subheading: (location: string) =>
      `${location} में उपलब्ध सत्यापित फिजियोथेरेपी क्लिनिक और होम-विज़िट विशेषज्ञ।`,
    citiesLabel: 'शहर',
    emptyTitle: 'कोई सटीक परिणाम नहीं मिला',
    emptyDescription: (location: string) =>
      `हम ${location} में आपकी खोज के अनुरूप कोई सत्यापित फिजियो नहीं ढूंढ पाए। नीचे BookPhysio का डेमो प्रीव्यू देखें।`,
    errorTitle: 'सर्च सिंक उपलब्ध नहीं',
    errorBody:
      'लाइव परिणाम अभी लोड नहीं हो पाए, लेकिन नीचे डेमो प्रीव्यू उपलब्ध है।',
    errorBodyRetrying: 'लाइव सर्च पुनः प्रयास के दौरान नवीनतम परिणाम दिखाए जा रहे हैं।',
    retrySearch: 'पुनः खोजें',
    clearFilters: 'सभी फ़िल्टर हटाएं',
    verifiedProfessionals: 'सत्यापित विशेषज्ञ',
    safetyVerified: 'सुरक्षा सत्यापित',
    closingQuote:
      '"सही थेरेपिस्ट से जुड़ना दर्द-मुक्त जीवन की पहली सीढ़ी है।"',
    demoPreview: 'डेमो प्रीव्यू',
    demoPreviewNote: 'ये कार्ड दिखाते हैं कि जब प्रदाता मेल खाएंगे तो लाइव परिणाम कैसे दिखेंगे।',
  },
} as const satisfies Record<StaticLocale, {
  breadcrumbRoot: string
  headingLoading: string
  headingResults: (total: number) => string
  headingEmpty: string
  subheading: (location: string) => string
  citiesLabel: string
  emptyTitle: string
  emptyDescription: (location: string) => string
  errorTitle: string
  errorBody: string
  errorBodyRetrying: string
  retrySearch: string
  clearFilters: string
  verifiedProfessionals: string
  safetyVerified: string
  closingQuote: string
  demoPreview: string
  demoPreviewNote: string
}>

// ─── Auth Pages ───────────────────────────────────────────────────────────────

export const AUTH_COPY = {
  en: {
    // Login
    loginHeading: 'Welcome back',
    loginSubheading: 'Access your recovery dashboard',
    loginTabPhone: 'Mobile OTP',
    loginTabEmail: 'Magic Link',
    loginLabelPhone: 'Mobile Number',
    loginLabelEmail: 'Email Address',
    loginButtonPhone: 'Secure Login',
    loginButtonEmail: 'Send Magic Link',
    loginButtonLoading: 'Authenticating...',
    loginInboxTitle: 'Check your inbox',
    loginInboxBody: (email: string) =>
      `If an account exists for ${email}, a magic login link is on its way.`,
    loginBackToLogin: 'Back to login',
    loginNewUser: 'New to BookPhysio?',
    loginCreateAccount: 'Create an account',
    loginIsDoctor: 'Are you a doctor?',
    loginJoinDoctor: 'Join as a doctor',
    // Signup
    signupHeading: 'Start your recovery',
    signupSubheading: 'Join thousands recovering smarter',
    signupLabelName: 'Full Name',
    signupLabelPhone: 'Mobile Number',
    signupButtonSubmit: 'Create Account',
    signupButtonLoading: 'Creating account...',
    signupAlreadyAccount: 'Already have an account?',
    signupLoginLink: 'Log in',
    // OTP verify
    otpHeading: 'Enter your code',
    otpSubheading: (phone: string) => `Code sent to ${phone}`,
    otpLoginSubheading: (phone: string) => `If an account exists, a code was sent to ${phone}`,
    otpVerifyButton: 'Verify Code',
    otpVerifyingButton: 'Verifying...',
    otpResend: 'Resend code',
    otpResendIn: (time: string) => `Resend in ${time}`,
    otpBack: 'Back',
    // General
    errorGeneral: 'Unable to continue right now.',
  },
  hi: {
    // Login
    loginHeading: 'वापस स्वागत है',
    loginSubheading: 'अपने रिकवरी डैशबोर्ड तक पहुंचें',
    loginTabPhone: 'मोबाइल OTP',
    loginTabEmail: 'मैजिक लिंक',
    loginLabelPhone: 'मोबाइल नंबर',
    loginLabelEmail: 'ईमेल पता',
    loginButtonPhone: 'सुरक्षित लॉगिन',
    loginButtonEmail: 'मैजिक लिंक भेजें',
    loginButtonLoading: 'प्रमाणित हो रहा है...',
    loginInboxTitle: 'अपना इनबॉक्स देखें',
    loginInboxBody: (email: string) =>
      `यदि ${email} के लिए कोई खाता है, तो मैजिक लॉगिन लिंक भेज दिया गया है।`,
    loginBackToLogin: 'लॉगिन पर वापस जाएं',
    loginNewUser: 'BookPhysio में नए हैं?',
    loginCreateAccount: 'खाता बनाएं',
    loginIsDoctor: 'क्या आप डॉक्टर हैं?',
    loginJoinDoctor: 'डॉक्टर के रूप में जुड़ें',
    // Signup
    signupHeading: 'रिकवरी शुरू करें',
    signupSubheading: 'हजारों लोगों के साथ स्मार्ट तरीके से ठीक हों',
    signupLabelName: 'पूरा नाम',
    signupLabelPhone: 'मोबाइल नंबर',
    signupButtonSubmit: 'खाता बनाएं',
    signupButtonLoading: 'खाता बन रहा है...',
    signupAlreadyAccount: 'पहले से खाता है?',
    signupLoginLink: 'लॉग इन करें',
    // OTP verify
    otpHeading: 'अपना कोड दर्ज करें',
    otpSubheading: (phone: string) => `${phone} पर कोड भेजा गया`,
    otpLoginSubheading: (phone: string) => `यदि खाता मौजूद है, तो ${phone} पर कोड भेजा गया`,
    otpVerifyButton: 'कोड सत्यापित करें',
    otpVerifyingButton: 'सत्यापित हो रहा है...',
    otpResend: 'कोड पुनः भेजें',
    otpResendIn: (time: string) => `${time} में पुनः भेजें`,
    otpBack: 'वापस',
    // General
    errorGeneral: 'अभी जारी रखना संभव नहीं है।',
  },
} as const satisfies Record<StaticLocale, {
  loginHeading: string
  loginSubheading: string
  loginTabPhone: string
  loginTabEmail: string
  loginLabelPhone: string
  loginLabelEmail: string
  loginButtonPhone: string
  loginButtonEmail: string
  loginButtonLoading: string
  loginInboxTitle: string
  loginInboxBody: (email: string) => string
  loginBackToLogin: string
  loginNewUser: string
  loginCreateAccount: string
  loginIsDoctor: string
  loginJoinDoctor: string
  signupHeading: string
  signupSubheading: string
  signupLabelName: string
  signupLabelPhone: string
  signupButtonSubmit: string
  signupButtonLoading: string
  signupAlreadyAccount: string
  signupLoginLink: string
  otpHeading: string
  otpSubheading: (phone: string) => string
  otpLoginSubheading: (phone: string) => string
  otpVerifyButton: string
  otpVerifyingButton: string
  otpResend: string
  otpResendIn: (time: string) => string
  otpBack: string
  errorGeneral: string
}>

// ─── Booking Page ─────────────────────────────────────────────────────────────

export const BOOKING_COPY = {
  en: {
    stepLabels: ['Identify', 'Vouch', 'Success'] as [string, string, string],
    loadingTitle: 'Securing Your Session',
    loadingSubtitle: 'Establishing high-fidelity connection...',
    protectedFlow: 'Protected Booking Flow',
    returnToPrevious: 'Return to previous step',
    amountDue: 'Amount Due',
  },
  hi: {
    stepLabels: ['पहचान', 'पुष्टि', 'सफल'] as [string, string, string],
    loadingTitle: 'आपका सत्र सुरक्षित हो रहा है',
    loadingSubtitle: 'कनेक्शन स्थापित हो रहा है...',
    protectedFlow: 'सुरक्षित बुकिंग प्रक्रिया',
    returnToPrevious: 'पिछले चरण पर वापस जाएं',
    amountDue: 'देय राशि',
  },
} as const satisfies Record<StaticLocale, {
  stepLabels: [string, string, string]
  loadingTitle: string
  loadingSubtitle: string
  protectedFlow: string
  returnToPrevious: string
  amountDue: string
}>

// ─── Patient Dashboard ────────────────────────────────────────────────────────

export const DASHBOARD_COPY = {
  en: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    verifiedPatient: 'Verified Patient',
    welcomeBack: (upcoming: number) =>
      `Welcome back to your recovery hub. You have ${upcoming} upcoming sessions this week.`,
    bookNewTherapy: 'Book New Therapy',
    askAI: 'Ask BookPhysio AI',
    // Snapshot cards
    nextSession: 'Next session',
    noBookingYet: 'No booking yet',
    findNextMatch: 'Find your next match with AI',
    recoveryPace: 'Recovery pace',
    recoveryOnTrack: 'On track with your mobility goal',
    careTeam: 'Care team',
    previousSpecialists: 'Previous specialists in record',
    aiGuidance: 'AI guidance',
    triageSymptoms: 'Triage symptoms in focused chat',
    // Recovery section
    recoveryJourney: 'Recovery Journey',
    activeTreatment: 'Active Treatment Phase',
    mobilityGoal: 'Mobility Goal Progress',
    onTrack: 'On Track',
    weeklyGoal: 'Weekly Goal',
    weeklyGoalDetail: '3 Sessions · 2 Complete',
    // Care team section
    myHealthTeam: 'My Health Team',
    buildTeam: 'Build your recovery team.',
    browseSpecialists: 'Browse Specialists',
    // Referral section
    referralBadge: 'Community Referral',
    referralHeading: 'Share the progress, get ₹500 off.',
    referralBody: 'Know someone struggling with recovery? Give them ₹500 off their first session and receive ₹500 credit once they complete it.',
    copyReferralLink: 'Copy My Referral Link',
    referralCopied: 'Referral Link Copied',
    // Upcoming
    nextBooking: 'Next Booking',
    activeUpcoming: 'Active Upcoming',
    manageBooking: 'Manage Booking',
    appointmentConfirmed: 'Appointment Confirmed',
    noPendingSessions: 'No pending sessions found',
    startRecovery: 'Start Recovery',
    // Support
    needHelp: 'Need help?',
    askAIShort: 'Ask BookPhysio AI',
    // Error
    errorTitle: 'Recovery feed unavailable',
    errorDesc: "We couldn't load your appointment activity right now. Please try again in a moment.",
    retrySync: 'Retry Sync',
    bookNewTherapyBtn: 'Book New Therapy',
  },
  hi: {
    greetingMorning: 'सुप्रभात',
    greetingAfternoon: 'नमस्ते',
    greetingEvening: 'शुभ संध्या',
    verifiedPatient: 'सत्यापित मरीज',
    welcomeBack: (upcoming: number) =>
      `आपके रिकवरी हब में वापस स्वागत है। इस सप्ताह आपके ${upcoming} आगामी सत्र हैं।`,
    bookNewTherapy: 'नई थेरेपी बुक करें',
    askAI: 'BookPhysio AI से पूछें',
    // Snapshot cards
    nextSession: 'अगला सत्र',
    noBookingYet: 'अभी तक कोई बुकिंग नहीं',
    findNextMatch: 'AI से अगला मिलान खोजें',
    recoveryPace: 'रिकवरी गति',
    recoveryOnTrack: 'आपके गतिशीलता लक्ष्य के अनुसार',
    careTeam: 'केयर टीम',
    previousSpecialists: 'पिछले विशेषज्ञ रिकॉर्ड में',
    aiGuidance: 'AI मार्गदर्शन',
    triageSymptoms: 'केंद्रित चैट में लक्षण जांचें',
    // Recovery section
    recoveryJourney: 'रिकवरी यात्रा',
    activeTreatment: 'सक्रिय उपचार चरण',
    mobilityGoal: 'गतिशीलता लक्ष्य प्रगति',
    onTrack: 'सही रास्ते पर',
    weeklyGoal: 'साप्ताहिक लक्ष्य',
    weeklyGoalDetail: '3 सत्र · 2 पूर्ण',
    // Care team section
    myHealthTeam: 'मेरी स्वास्थ्य टीम',
    buildTeam: 'अपनी रिकवरी टीम बनाएं।',
    browseSpecialists: 'विशेषज्ञ खोजें',
    // Referral section
    referralBadge: 'सामुदायिक रेफरल',
    referralHeading: 'प्रगति साझा करें, ₹500 की छूट पाएं।',
    referralBody:
      'कोई जानने वाला रिकवरी में संघर्ष कर रहा है? उन्हें पहले सत्र पर ₹500 की छूट दें और उनके पूरा होने पर ₹500 क्रेडिट पाएं।',
    copyReferralLink: 'मेरा रेफरल लिंक कॉपी करें',
    referralCopied: 'रेफरल लिंक कॉपी हो गया',
    // Upcoming
    nextBooking: 'अगली बुकिंग',
    activeUpcoming: 'सक्रिय आगामी',
    manageBooking: 'बुकिंग प्रबंधित करें',
    appointmentConfirmed: 'अपॉइंटमेंट पुष्टि हो गई',
    noPendingSessions: 'कोई लंबित सत्र नहीं मिला',
    startRecovery: 'रिकवरी शुरू करें',
    // Support
    needHelp: 'मदद चाहिए?',
    askAIShort: 'BookPhysio AI से पूछें',
    // Error
    errorTitle: 'रिकवरी फ़ीड उपलब्ध नहीं',
    errorDesc: 'अभी आपकी अपॉइंटमेंट गतिविधि लोड नहीं हो पाई। कृपया कुछ देर बाद फिर प्रयास करें।',
    retrySync: 'पुनः सिंक करें',
    bookNewTherapyBtn: 'नई थेरेपी बुक करें',
  },
} as const satisfies Record<StaticLocale, {
  greetingMorning: string
  greetingAfternoon: string
  greetingEvening: string
  verifiedPatient: string
  welcomeBack: (upcoming: number) => string
  bookNewTherapy: string
  askAI: string
  nextSession: string
  noBookingYet: string
  findNextMatch: string
  recoveryPace: string
  recoveryOnTrack: string
  careTeam: string
  previousSpecialists: string
  aiGuidance: string
  triageSymptoms: string
  recoveryJourney: string
  activeTreatment: string
  mobilityGoal: string
  onTrack: string
  weeklyGoal: string
  weeklyGoalDetail: string
  myHealthTeam: string
  buildTeam: string
  browseSpecialists: string
  referralBadge: string
  referralHeading: string
  referralBody: string
  copyReferralLink: string
  referralCopied: string
  nextBooking: string
  activeUpcoming: string
  manageBooking: string
  appointmentConfirmed: string
  noPendingSessions: string
  startRecovery: string
  needHelp: string
  askAIShort: string
  errorTitle: string
  errorDesc: string
  retrySync: string
  bookNewTherapyBtn: string
}>

// ─── Provider Dashboard ───────────────────────────────────────────────────────

export const PROVIDER_COPY = {
  en: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    clinicStatus: 'Clinic Status: Operational',
    tagline: 'Manage your session flow, track performance insights, and stay connected with your patients in 12 verified practice cities.',
    openCalendar: 'Open Calendar',
    askAI: 'Ask BookPhysio AI',
    appointmentFlow: 'Appointment Flow',
    estimatedSession: (minutes: number) => `Estimated ${minutes}m in-session today`,
    incomingSession: 'Incoming Session',
    noPending: 'NO PENDING',
    agendaComplete: 'Treatment agenda complete',
    weeklyReach: 'Weekly Reach',
    percentTarget: (pct: number) => `${pct}% Target`,
    practiceAgenda: 'Practice Agenda',
    confirmedRoadmap: 'Confirmed Patient Roadmap',
    tabToday: 'Today',
    tabThisWeek: 'This Week',
    emptyCalendarTitle: 'Treatment calendar Clear',
    emptyCalendarDesc: 'No upcoming sessions found for this timeframe. Focus on your performance analytics.',
    regularCheckup: 'Regular Checkup',
    practiceReadiness: 'Practice Readiness',
    earningsOutlook: 'Earnings Outlook',
    earningsComingSoon: 'Coming soon',
    earningsNote: 'Earnings analytics in next release',
    viewAnalytics: 'View Analytics',
    errorTitle: 'Clinical sync unavailable',
    errorDesc: "We couldn't load your provider schedule right now. Please retry in a moment.",
    retrySync: 'Retry Sync',
    checklistClinicalProfile: 'Clinical Profile',
    checklistClinicalProfileSub: 'Qualifications & Photo',
    checklistAvailability: 'Work Availability',
    checklistAvailabilitySub: 'Clinical Hours & Buffer',
    checklistVerification: 'Account Verification',
    checklistVerificationSub: 'KYC & License Check',
    upNext: 'UP NEXT',
  },
  hi: {
    greetingMorning: 'सुप्रभात',
    greetingAfternoon: 'नमस्ते',
    greetingEvening: 'शुभ संध्या',
    clinicStatus: 'क्लिनिक स्थिति: संचालित',
    tagline: 'अपने सत्र प्रवाह को प्रबंधित करें, प्रदर्शन अंतर्दृष्टि ट्रैक करें, और 12 सत्यापित शहरों में अपने मरीजों से जुड़े रहें।',
    openCalendar: 'कैलेंडर खोलें',
    askAI: 'BookPhysio AI से पूछें',
    appointmentFlow: 'अपॉइंटमेंट प्रवाह',
    estimatedSession: (minutes: number) => `आज अनुमानित ${minutes} मिनट सत्र में`,
    incomingSession: 'आगामी सत्र',
    noPending: 'कोई लंबित नहीं',
    agendaComplete: 'उपचार एजेंडा पूर्ण',
    weeklyReach: 'साप्ताहिक पहुंच',
    percentTarget: (pct: number) => `${pct}% लक्ष्य`,
    practiceAgenda: 'प्रैक्टिस एजेंडा',
    confirmedRoadmap: 'पुष्ट मरीज रोडमैप',
    tabToday: 'आज',
    tabThisWeek: 'इस सप्ताह',
    emptyCalendarTitle: 'उपचार कैलेंडर खाली',
    emptyCalendarDesc: 'इस समय सीमा में कोई आगामी सत्र नहीं मिला। अपने प्रदर्शन विश्लेषण पर ध्यान दें।',
    regularCheckup: 'नियमित जांच',
    practiceReadiness: 'प्रैक्टिस तैयारी',
    earningsOutlook: 'आय दृष्टिकोण',
    earningsComingSoon: 'जल्द आ रहा है',
    earningsNote: 'अगले अपडेट में आय विश्लेषण',
    viewAnalytics: 'विश्लेषण देखें',
    errorTitle: 'क्लिनिकल सिंक उपलब्ध नहीं',
    errorDesc: 'आपका प्रदाता शेड्यूल अभी लोड नहीं हो पाया। कृपया कुछ देर बाद पुनः प्रयास करें।',
    retrySync: 'पुनः सिंक करें',
    checklistClinicalProfile: 'क्लिनिकल प्रोफाइल',
    checklistClinicalProfileSub: 'योग्यताएं और फोटो',
    checklistAvailability: 'कार्य उपलब्धता',
    checklistAvailabilitySub: 'क्लिनिकल घंटे और बफर',
    checklistVerification: 'खाता सत्यापन',
    checklistVerificationSub: 'KYC और लाइसेंस जांच',
    upNext: 'अगला',
  },
} as const satisfies Record<StaticLocale, {
  greetingMorning: string
  greetingAfternoon: string
  greetingEvening: string
  clinicStatus: string
  tagline: string
  openCalendar: string
  askAI: string
  appointmentFlow: string
  estimatedSession: (minutes: number) => string
  incomingSession: string
  noPending: string
  agendaComplete: string
  weeklyReach: string
  percentTarget: (pct: number) => string
  practiceAgenda: string
  confirmedRoadmap: string
  tabToday: string
  tabThisWeek: string
  emptyCalendarTitle: string
  emptyCalendarDesc: string
  regularCheckup: string
  practiceReadiness: string
  earningsOutlook: string
  earningsComingSoon: string
  earningsNote: string
  viewAnalytics: string
  errorTitle: string
  errorDesc: string
  retrySync: string
  checklistClinicalProfile: string
  checklistClinicalProfileSub: string
  checklistAvailability: string
  checklistAvailabilitySub: string
  checklistVerification: string
  checklistVerificationSub: string
  upNext: string
}>

/** Returns the /hi/-prefixed path for a given path when locale is 'hi'. */
export function localePath(locale: StaticLocale, path: string): string {
  return locale === 'hi' ? `/hi${path}` : path
}
