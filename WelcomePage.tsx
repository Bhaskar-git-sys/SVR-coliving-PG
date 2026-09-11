import { ArrowRight, CheckCircle2 } from 'lucide-react';
import logo from '../assets/svr-logo.jpeg';

interface WelcomePageProps {
  pgName: string;
  onContinue: () => void;
}

export default function WelcomePage({
  pgName,
  onContinue,
}: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,104,22,0.2),transparent_40%),radial-gradient(circle_at_12%_90%,rgba(207,24,17,0.16),transparent_35%),linear-gradient(135deg,#0a101a_0%,#20120f_56%,#32130d_100%)]" />

      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-[min(94vw,54rem)] -translate-x-1/2 -translate-y-1/2 opacity-15 mix-blend-screen pointer-events-none"
      />

      {/* Decorative circles */}
      <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full border border-gold-400/10 animate-float" />

      <div className="absolute -bottom-48 -left-24 w-[30rem] h-[30rem] rounded-full border border-navy-500/30" />

      {/* Main Content */}
      <div className="relative w-full max-w-xl text-center animate-slide-up">

        {/* SVR Logo */}
        <div className="mx-auto mb-7 w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-black/20 border border-gold-400/20 flex items-center justify-center shadow-2xl shadow-gold-500/20 animate-pulse-glow overflow-hidden">

          <img
            src={logo}
            alt="svr-logo.jpeg"
            className="w-full h-full object-contain p-2"
          />

        </div>

        {/* PG Name */}
        <p className="text-gold-400 text-xs font-bold tracking-[0.28em] uppercase mb-4">
          {pgName}
        </p>

        {/* Welcome Heading */}
        <h1 className="font-display font-bold text-3xl sm:text-5xl leading-tight mb-4">
          Welcome to SVR Co-Living PG

          <span
            className="text-gold-400 ml-2"
            aria-hidden="true"
          >
            👋
          </span>
        </h1>

        {/* Description */}
        <p className="text-navy-200 text-base sm:text-lg mb-7">
          Your PG management system is ready.
        </p>

        {/* Property Information */}
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/10 px-4 py-2 text-sm text-gold-200 mb-9">

          <CheckCircle2 className="w-4 h-4 text-gold-400" />

          <span>6 Floors</span>

          <span className="text-gold-400/60">
            •
          </span>

          <span>48 Rooms</span>

        </div>

        {/* Continue Button */}
        <div>
          <button
            onClick={onContinue}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-3.5 text-sm font-bold text-navy-900 shadow-lg shadow-gold-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold-500/30"
          >
            Continue to Room Chart

            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>

      </div>
    </div>
  );
}