import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, Lock, Sparkles } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <>
      <Navbar locale="en" localeSwitchPath="/privacy" />

      <main className="bg-white min-h-screen">
        {/* Full-width Title Section - Clinical Legal Style */}
        <section className="bg-bp-surface text-bp-primary py-24 sm:py-32 relative overflow-hidden border-b border-bp-border">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-bp-accent/5 rounded-full blur-[140px] -mr-80 -mt-80"></div>
          
          <div className="max-w-[1142px] mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-bp-accent/5 border border-bp-accent/10 rounded-full text-[12px] font-bold uppercase tracking-[0.3em] mb-10 text-bp-accent">
               Data Protection Office
            </div>
            <h1 className="text-[56px] sm:text-[72px] font-bold mb-8 tracking-tighter leading-[0.9] text-bp-primary">
              Privacy <span className="text-bp-accent italic">Policy</span>
            </h1>
            <p className="text-[18px] sm:text-[22px] text-bp-body/60 font-medium">
              Last Updated: March 2026 • Clinical Governance v4.2
            </p>
          </div>
        </section>

        {/* Legal Grid */}
        <section className="py-24 sm:py-40 bg-white">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
              
              {/* Table of Contents - Sidebar */}
              <div className="lg:col-span-4 sticky top-32 group">
                 <div className="space-y-16">
                    <div>
                       <h2 className="text-[12px] font-bold text-bp-primary uppercase tracking-[0.4em] mb-12">Legal Index</h2>
                       <ul className="space-y-6">
                          <li><a href="#introduction" className="text-[20px] font-bold text-bp-primary hover:text-bp-primary transition-all flex items-center gap-4 group/item">1.0 Introduction <div className="w-1.5 h-1.5 rounded-full bg-bp-primary"></div></a></li>
                          <li><a href="#data-collection" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">2.0 Collection</a></li>
                          <li><a href="#data-usage" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">3.0 Usage</a></li>
                          <li><a href="#data-security" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">4.0 Security</a></li>
                          <li><a href="#sharing" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">5.0 Sharing</a></li>
                       </ul>
                    </div>

                    <div className="p-10 bg-bp-surface rounded-2xl border border-bp-border/40 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-bp-primary/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                       <ShieldCheck className="w-10 h-10 text-bp-primary mb-8" />
                       <h3 className="text-[24px] font-bold text-bp-primary mb-5 tracking-tight">Clinical Governance</h3>
                       <p className="text-[17px] text-bp-body/60 font-medium leading-relaxed mb-8">
                         We use layered technical and organisational safeguards designed to protect account, booking, and payment data on the platform.
                       </p>
                       <div className="flex items-center gap-3 text-bp-primary font-bold text-[12px] uppercase tracking-widest">
                          <Lock className="w-4 h-4" /> Secured Protocol
                       </div>
                    </div>
                 </div>
              </div>

              {/* Legal Text - Main Content */}
              <div className="lg:col-span-8">
                <div className="prose prose-lg max-w-none text-bp-body/70 font-medium leading-[1.9] space-y-24">
                  
                  <section id="introduction" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-bp-accent shadow-[0_0_12px_rgba(255,107,53,0.4)]"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">1.0 Introduction</h2>
                    </div>
                    <p className="text-[20px] text-bp-primary font-bold leading-relaxed mb-8">
                      At BookPhysio.in, your privacy is our top clinical priority. 
                    </p>
                    <p>
                      This Privacy Policy describes how we collect, use, and share your personal information when you use our website, 
                      mobile application, and related clinical services (collectively, the &quot;Platform&quot;).
                      Our privacy approach is built around minimum necessary data use, access control, and operational safeguards.
                    </p>
                  </section>

                  <section id="data-collection" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-bp-primary shadow-[0_0_12px_rgba(0,118,108,0.4)]"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">2.0 Information Collection</h2>
                    </div>
                    <p className="mb-10">To provide you with the best experience and clinical care, we may collect several types of Information:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                       <div className="p-8 bg-bp-surface/50 border border-bp-border/40 rounded-[32px]">
                          <h4 className="text-[18px] font-bold text-bp-primary mb-4">Personal Data</h4>
                          <p className="text-[16px] text-bp-body/60 italic">Name, age, gender, phone number, and verified email address.</p>
                       </div>
                       <div className="p-8 bg-bp-surface/50 border border-bp-border/40 rounded-[32px]">
                          <h4 className="text-[18px] font-bold text-bp-primary mb-4">Clinical Data</h4>
                          <p className="text-[16px] text-bp-body/60 italic">Reason for visit, preferred visit types, and historical booking logs.</p>
                       </div>
                    </div>
                  </section>

                  <section id="data-usage" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-bp-accent"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">3.0 How We Use Your Information</h2>
                    </div>
                    <ul className="list-none p-0 space-y-6">
                      {[
                        'To facilitate and confirm clinical bookings with verified physiotherapists.',
                        'To verify the ICP registration and credentials of providers.',
                        'To calculate booking charges, prepare GST-compliant summaries, and support future online payment flows when they are enabled.',
                        'To send real-time appointment reminders and clinical updates via MSG91.'
                      ].map((item, i) => (
                        <li key={i} className="flex gap-4 items-start text-[18px]">
                           <div className="w-6 h-6 rounded-full bg-bp-primary/10 flex items-center justify-center shrink-0 mt-1">
                              <div className="w-2 h-2 rounded-full bg-bp-primary"></div>
                           </div>
                           {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section id="data-security" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-bp-secondary"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">4.0 Security Measures</h2>
                    </div>
                    <div className="p-10 bg-bp-primary text-white rounded-3xl overflow-hidden relative group">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-bp-accent/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                       <Lock className="w-8 h-8 text-bp-accent mb-6" />
                       <p className="text-[19px] font-medium leading-relaxed opacity-80 relative z-10">
                        We implement industry-standard technical and organizational measures to safeguard your information 
                        against unauthorized access, modification, or destruction. <span className="text-white font-bold italic">We never sell your personal or clinical data to third-party advertisers.</span>
                       </p>
                    </div>
                  </section>

                  <section id="sharing" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">5.0 Information Sharing</h2>
                    </div>
                    <p className="text-[18px] leading-relaxed">
                      We only share information that is necessary to deliver the booking and care experience. That can include appointment details shared with your selected physiotherapist, payment details shared with a payment processor when supported online payments are enabled, prompts you choose to submit through BookPhysio AI features that are processed by our AI service providers to generate a response, and legally required disclosures to regulators or law-enforcement authorities when applicable.
                    </p>
                  </section>

                  <section className="bg-bp-surface px-10 py-10 rounded-3xl mt-16 border border-bp-border/40 group">
                     <div className="flex flex-col md:flex-row gap-10 items-center text-center md:text-left">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-bp-border/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                           <Sparkles className="w-10 h-10 text-bp-primary" />
                        </div>
                        <div>
                           <h3 className="text-[24px] font-bold text-bp-primary mb-2">Data Protection Officer</h3>
                           <p className="text-[17px] text-bp-body/60 font-medium mb-4">Questions regarding clinical data privacy or protection protocols?</p>
                           <a href="mailto:privacy@bookphysio.in" className="text-[18px] font-bold text-bp-primary underline decoration-2 underline-offset-8 hover:text-bp-primary transition-colors italic">privacy@bookphysio.in</a>
                        </div>
                     </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/privacy" />
    </>
  )
}
