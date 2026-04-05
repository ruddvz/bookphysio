import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileText, AlertCircle, Scale, CheckCircle2 } from 'lucide-react'

export default function TermsPage() {
  return (
    <>
      <Navbar locale="en" localeSwitchPath="/terms" />

      <main className="bg-white min-h-screen">
        {/* Full-width Title Section - Clinical Legal Style */}
        <section className="bg-bp-surface text-bp-primary py-24 sm:py-32 relative overflow-hidden border-b border-bp-border">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-bp-accent/5 rounded-full blur-[140px] -mr-80 -mt-80"></div>
          
          <div className="max-w-[1142px] mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-bp-accent/5 border border-bp-accent/10 rounded-full text-[12px] font-bold uppercase tracking-[0.3em] mb-10 text-bp-accent">
               Legal Framework
            </div>
            <h1 className="text-[56px] sm:text-[72px] font-bold mb-8 tracking-tighter leading-[0.9] text-bp-primary">
              Terms of <span className="text-bp-accent italic">Service</span>
            </h1>
            <p className="text-[18px] sm:text-[22px] text-bp-body/60 font-medium">
              Last Updated: March 2026 • Agreement v2.1
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
                       <h2 className="text-[12px] font-bold text-bp-primary uppercase tracking-[0.4em] mb-12">Agreement Index</h2>
                       <ul className="space-y-6">
                          <li><a href="#acceptance" className="text-[20px] font-bold text-bp-primary hover:text-bp-primary transition-all flex items-center gap-4 group/item">1.0 Acceptance <div className="w-1.5 h-1.5 rounded-full bg-bp-primary"></div></a></li>
                          <li><a href="#description" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">2.0 Service Scope</a></li>
                          <li><a href="#responsibilities" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">3.0 Responsibilities</a></li>
                          <li><a href="#verification" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">4.0 Provider Audit</a></li>
                          <li><a href="#liability" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">5.0 Liability</a></li>
                       </ul>
                    </div>

                    <div className="p-10 bg-bp-surface rounded-2xl border border-bp-border/40 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-bp-primary/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                       <Scale className="w-10 h-10 text-bp-primary mb-8" />
                       <h3 className="text-[24px] font-bold text-bp-primary mb-5 tracking-tight">Legal Transparency</h3>
                       <p className="text-[17px] text-bp-body/60 font-medium leading-relaxed mb-8">
                         Our terms ensure clear boundaries between the technology platform and the physical rehabilitation services provided by clinicians.
                       </p>
                       <div className="flex items-center gap-3 text-bp-primary font-bold text-[12px] uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" /> Binding Agreement
                       </div>
                    </div>
                 </div>
              </div>

              {/* Legal Text - Main Content */}
              <div className="lg:col-span-8">
                <div className="prose prose-lg max-w-none text-bp-body/70 font-medium leading-[1.9] space-y-24">
                  
                  <section id="acceptance" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-bp-accent shadow-[0_0_12px_rgba(255,107,53,0.4)]"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">1.0 Acceptance of Terms</h2>
                    </div>
                    <p className="text-[20px] text-bp-primary font-bold leading-relaxed mb-8">
                      Welcome to BookPhysio.in. By using our website and services, you enter into a binding legal agreement. 
                    </p>
                    <p>
                       You agree to comply with and be bound by the following terms and conditions. If you do not agree to these terms, 
                       please refrain from using our clinical marketplace. These terms apply to all patients, visitors, and 
                       physiotherapy providers globally.
                    </p>
                  </section>

                  <section id="description" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-bp-primary shadow-[0_0_12px_rgba(0,118,108,0.4)]"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">2.0 Service Description</h2>
                    </div>
                    <div className="p-10 bg-bp-primary text-white rounded-3xl overflow-hidden relative group mb-10">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-bp-accent/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                       <FileText className="w-8 h-8 text-bp-accent mb-6" />
                       <p className="text-[19px] font-medium leading-relaxed opacity-80 relative z-10">
                        BookPhysio provides a digital platform connecting patients with physiotherapists. 
                        We act strictly as an intermediary and marketplace. <span className="text-white font-bold italic">BookPhysio does not provide medical advice or physiotherapy services directly.</span>
                       </p>
                    </div>
                    <p>
                        Clinical outcomes are the sole responsibility of the attending physiotherapist.
                    </p>
                  </section>

                  <section id="responsibilities" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-bp-accent"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">3.0 User Responsibilities</h2>
                    </div>
                    <ul className="list-none p-0 space-y-6">
                      {[
                        'Users are responsible for providing accurate personal and medical history for clinical safety.',
                        'Booking charges and collection instructions are shown during checkout, and some sessions may currently be settled directly with the provider during the visit.',
                        'Cancellations must follow the established 4-hour advance window to ensure provider availability.',
                        'Users must respect the clinical boundaries of the physiotherapists during home-visit sessions.'
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

                  <section id="verification" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-bp-secondary"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">4.0 Provider Verification</h2>
                    </div>
                    <p className="text-[18px] leading-relaxed">
                       We aim to verify all physiotherapists through their <span className="text-bp-primary font-bold">ICP (Indian Council of Physiotherapy)</span> registration. 
                       However, patients are advised to use their own judgment in choosing the right provider for their clinical needs. 
                       BookPhysio is not liable for any clinical outcome based on treatment decisions.
                    </p>
                  </section>

                  <section id="liability" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">5.0 Limitation of Liability</h2>
                    </div>
                    <p className="text-[18px] leading-relaxed">
                      BookPhysio is responsible for operating the marketplace and payment workflow with reasonable care, but the clinical advice, diagnosis, treatment plan, and therapeutic outcome remain the responsibility of the treating physiotherapist. To the extent permitted by law, our liability is limited to the platform fees paid for the affected booking.
                    </p>
                  </section>

                  <section className="bg-bp-surface px-10 py-10 rounded-3xl mt-16 border border-bp-border/40 group overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-bp-accent/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                     <div className="flex flex-col md:flex-row gap-10 items-center text-center md:text-left relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-bp-border/60 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                           <AlertCircle className="w-10 h-10 text-bp-accent" />
                        </div>
                        <div>
                           <h3 className="text-[24px] font-bold text-bp-primary mb-2">Notice of Changes</h3>
                           <p className="text-[17px] text-bp-body/60 font-medium mb-0">
                             These terms are subject to change without prior notice. Continued use of the platform constitutes full agreement to the updated clinical framework.
                           </p>
                        </div>
                     </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/terms" />
    </>
  )
}
