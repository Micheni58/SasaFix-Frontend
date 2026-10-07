import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle, Twitter } from "lucide-react";
import Brand from "./Brand";

export default function Footer() {
  return (
    <footer className="bg-[#023c65] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Brand light />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">Trusted local professionals, right when you need them.</p>
        </div>
        <div>
          <h3 className="font-bold">Quick links</h3>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <a href="#about" className="block hover:text-white">About</a>
            <Link to="/client/find-services" className="block hover:text-white">Services</Link>
            <a href="#careers" className="block hover:text-white">Careers</a>
            <a href="#blog" className="block hover:text-white">Blog</a>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Contact</h3>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <a href="mailto:info@sasafix.co.ke" className="block hover:text-white">info@sasafix.co.ke</a>
            <a href="tel:+254700000000" className="block hover:text-white">+254 700 000 000</a>
            <p>Nairobi, Kenya</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Follow us</h3>
          <div className="mt-4 flex gap-3">
            {[Facebook, Instagram, Twitter, MessageCircle].map((Icon, index) => (
              <a key={index} href="#social" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20" aria-label="Social media">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-white/50">© 2024 Sasafix. All rights reserved.</div>
    </footer>
  );
}
