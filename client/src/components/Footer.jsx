import { Mail, Phone, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/55 px-5 py-6 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-200">
            <Sparkles size={16} />
            Built as a premium AI-powered layout transformation experience
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Designed for conversational editing, real-time previews, and intelligent design automation.
          </p>
        </div>

        <div className="grid gap-2 text-sm text-slate-300">
          <strong className="text-base text-white">Bhoja Adarsh</strong>
          <a className="flex items-center gap-2 transition hover:text-cyan-200" href="mailto:adarshboja70@gmail.com">
            <Mail size={15} />
            adarshboja70@gmail.com
          </a>
          <a className="flex items-center gap-2 transition hover:text-cyan-200" href="tel:+917013650721">
            <Phone size={15} />
            +91 7013650721
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
