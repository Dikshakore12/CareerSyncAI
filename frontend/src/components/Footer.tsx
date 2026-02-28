import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">

          {/* Brand */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-gray-900">CareerSync AI</span>
            </Link>
            <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md">
              Bridging the gap between talent and opportunity with intelligent, AI-powered career guidance.
            </p>
            <div className="flex items-center space-x-3">
              <a href="#" className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            <div className="space-y-5">
              <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Navigate</h5>
              <ul className="space-y-3 text-base font-bold text-gray-400">
                <li><Link href="/"          className="hover:text-indigo-600 transition-colors">Home</Link></li>
                <li><Link href="/platform"  className="hover:text-indigo-600 transition-colors">Platform</Link></li>
                <li><Link href="/analytics" className="hover:text-indigo-600 transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div className="space-y-5">
              <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Company</h5>
              <ul className="space-y-3 text-base font-bold text-gray-400">
                <li><Link href="/about"   className="hover:text-indigo-600 transition-colors">About Us</Link></li>
                <li><Link href="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div className="space-y-5">
              <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Account</h5>
              <ul className="space-y-3 text-base font-bold text-gray-400">
                <li><Link href="/login"  className="hover:text-indigo-600 transition-colors">Login</Link></li>
                <li><Link href="/signup" className="hover:text-indigo-600 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-gray-400 font-bold text-xs uppercase tracking-widest">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Nagpur, India</span>
            <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@careersync.ai</span>
          </div>
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            © 2026 CareerSync AI. Engineered for Professionals.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
