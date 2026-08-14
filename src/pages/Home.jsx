import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock3,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import Footer from "../components/Footer";
import HomeNavbar from "../components/HomeNavbar";
import ServiceSearch from "../components/ServiceSearch";

const categories = [
  { name: "Plumbing", icon: Wrench, count: "120+ professionals", color: "bg-sky-50 text-sky-600" },
  { name: "Electrician", icon: Zap, count: "98+ professionals", color: "bg-amber-50 text-amber-600" },
  { name: "Cleaning", icon: Bell, count: "160+ professionals", color: "bg-violet-50 text-violet-600" },
  { name: "Painting", icon: BriefcaseBusiness, count: "76+ professionals", color: "bg-rose-50 text-rose-600" },
  { name: "Carpentry", icon: Wrench, count: "65+ professionals", color: "bg-orange-50 text-orange-600" },
  { name: "Gardening", icon: CheckCircle2, count: "52+ professionals", color: "bg-emerald-50 text-emerald-600" },
  { name: "Moving", icon: Layers3, count: "48+ professionals", color: "bg-indigo-50 text-indigo-600" },
  { name: "Appliance Repair", icon: Zap, count: "84+ professionals", color: "bg-cyan-50 text-cyan-600" },
];

const professionals = [
  { name: "James Mwangi", category: "Plumbing specialist", initials: "JM", tone: "bg-blue-100 text-[#034d80]" },
  { name: "Faith Wanjiku", category: "Cleaning professional", initials: "FW", tone: "bg-rose-100 text-rose-700" },
  { name: "David Otieno", category: "Electrician", initials: "DO", tone: "bg-amber-100 text-amber-700" },
  { name: "Mary Njeri", category: "Home painter", initials: "MN", tone: "bg-violet-100 text-violet-700" },
  { name: "Kevin Kiptoo", category: "Appliance repair", initials: "KK", tone: "bg-emerald-100 text-emerald-700" },
];

const testimonials = [
  { quote: "I found a great plumber within minutes. The whole booking process was easy and transparent.", name: "Anne W.", place: "Westlands, Nairobi" },
  { quote: "My electrician arrived on time and did excellent work. Sasafix made it feel completely stress-free.", name: "Brian K.", place: "Kilimani, Nairobi" },
  { quote: "A reliable cleaner for my home, booked in just a few taps. I will definitely use Sasafix again.", name: "Sharon M.", place: "Ruaka, Kiambu" },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] font-['Sora',sans-serif] text-[#1A202C]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');`}</style>

      <HomeNavbar authVariant={false} />

      <main>
        <section className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#034d80_0%,#2e96d4_100%)] pb-18 pt-34 text-white sm:pb-24 sm:pt-40">
          <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(circle_at_85%_25%,white_0,transparent_20%),radial-gradient(circle_at_5%_100%,#0d6fad_0,transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur"><ShieldCheck className="h-4 w-4" /> Verified local professionals</span>
              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">Find trusted local professionals in Kenya</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">Connect with verified plumbers, electricians, cleaners, and more—right when you need them.</p>
              <div className="mt-8 max-w-2xl"><ServiceSearch /></div>
              <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 text-sm font-semibold text-white/90">
                {["500+ professionals", "4.8/5 average rating", "10K+ bookings"].map((item, index) => <span key={item} className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">{index === 1 ? <Star className="h-3.5 w-3.5 fill-[#F28C28] text-[#F28C28]" /> : <CheckCircle2 className="h-4 w-4" />}</span>{item}</span>)}
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:col-span-2">
              <div className="absolute -inset-8 rounded-full bg-white/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/25 bg-white/15 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold text-white/80">Popular services</span><MapPin className="h-5 w-5 text-[#F28C28]" /></div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {categories.slice(0, 6).map(({ name, icon: Icon }) => <div key={name} className="rounded-2xl border border-white/15 bg-white/10 p-4 transition hover:-translate-y-1 hover:bg-white/20"><Icon className="h-6 w-6 text-[#F28C28]" /><p className="mt-3 text-sm font-bold">{name}</p><p className="mt-1 text-xs text-white/65">Available now</p></div>)}
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 text-[#034d80] shadow-lg"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50"><Clock3 className="h-5 w-5" /></div><div><p className="text-sm font-bold">Quick booking</p><p className="text-xs text-slate-500">Book a pro in minutes</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-[#2e96d4]">Our services</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1A202C] sm:text-4xl">Browse services by category</h2><p className="mt-3 text-slate-500">Find skilled professionals for every job around your home.</p></div><div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{categories.map(({ name, icon: Icon, count, color }) => <Link key={name} to={`/client/find-services?category=${encodeURIComponent(name)}`} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-100 hover:shadow-xl"><span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}><Icon className="h-6 w-6" /></span><h3 className="mt-4 font-bold text-slate-800">{name}</h3><p className="mt-1 text-xs text-slate-500">{count}</p><ArrowRight className="mt-4 h-4 w-4 text-[#2e96d4] transition-transform group-hover:translate-x-1" /></Link>)}</div></section>

        <section className="bg-white py-18"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center"><p className="text-sm font-bold uppercase tracking-widest text-[#2e96d4]">Simple and secure</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">How Sasafix works</h2></div><div className="mt-12 grid gap-8 md:grid-cols-3">{[[Search,"Search","Find a service near you"],[Calendar,"Book","Schedule at your convenience"],[ShieldCheck,"Pay","Secure M-Pesa payment"]].map(([Icon, title, description], index) => <div key={title} className="relative text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-xl font-extrabold text-[#034d80]"><Icon className="h-7 w-7" /></span><span className="absolute left-[calc(50%+44px)] top-8 hidden h-px w-[calc(100%-88px)] bg-sky-100 md:block" /><p className="mt-5 text-xs font-extrabold text-[#2e96d4]">STEP 0{index + 1}</p><h3 className="mt-2 text-xl font-bold">{title}</h3><p className="mt-2 text-slate-500">{description}</p></div>)}</div></div></section>

        <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-[#2e96d4]">Trusted experts</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Top-rated professionals near you</h2></div><Link to="/client/find-services" className="text-sm font-bold text-[#034d80] hover:text-[#2e96d4]">Explore all professionals →</Link></div><div className="mt-9 flex snap-x gap-5 overflow-x-auto pb-4">{professionals.map((professional) => <article key={professional.name} className="min-w-65 snap-start rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-extrabold ${professional.tone}`}>{professional.initials}</div><h3 className="mt-4 font-bold">{professional.name}</h3><p className="mt-1 text-sm text-slate-500">{professional.category}</p><p className="mt-3 flex items-center gap-1 text-sm font-bold text-slate-700"><Star className="h-4 w-4 fill-[#F28C28] text-[#F28C28]" />4.8 <span className="font-normal text-slate-400">(120+ jobs)</span></p><Link to="/client/find-services" className="mt-5 block rounded-lg bg-[#034d80] py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#023c65]">Book now</Link></article>)}</div></section>

        <section className="bg-white py-18"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center"><p className="text-sm font-bold uppercase tracking-widest text-[#2e96d4]">Testimonials</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">What our customers say</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{testimonials.map((testimonial) => <figure key={testimonial.name} className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-6"><div className="flex gap-1">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4 fill-[#F28C28] text-[#F28C28]" />)}</div><blockquote className="mt-5 leading-7 text-slate-600">“{testimonial.quote}”</blockquote><figcaption className="mt-6"><p className="font-bold text-slate-800">{testimonial.name}</p><p className="text-sm text-slate-500">{testimonial.place}</p></figcaption></figure>)}</div></div></section>

        <section className="px-4 py-18 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#e0f2fe,#dbeafe)] px-6 py-14 text-center sm:px-12"><Users className="mx-auto h-9 w-9 text-[#2e96d4]" /><h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Ready to get started?</h2><p className="mx-auto mt-3 max-w-xl text-slate-600">Join thousands of Kenyans finding trusted professionals for the jobs that matter.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/client/find-services" className="rounded-lg bg-[#F28C28] px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#df761b]">Find a professional</Link><Link to="/signup" className="rounded-lg border border-[#034d80] bg-white px-6 py-3 font-bold text-[#034d80] transition hover:bg-sky-50">Become a provider</Link></div></div></section>
      </main>

      <Footer />
    </div>
  );
}
