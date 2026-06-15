import React from 'react';

interface GlobalSplashProps {
  message: string;
  progress: number;
}

export default function GlobalSplash({ message, progress }: GlobalSplashProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#121316] text-white overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#121316] via-[#0d0e11] to-[#001b44]/40"></div>
      <div className="absolute inset-0 stadium-mesh opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="relative inline-block mb-12 animate-float">
          <div className="absolute inset-0 bg-[#034226]/30 blur-3xl rounded-full"></div>
          
          {/* Rotating Rings */}
          <svg className="absolute inset-[-10%] w-[120%] h-[120%] animate-spin text-[#e1b12c] -z-10" style={{ animationDuration: '6s' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="70 30" strokeLinecap="round" />
          </svg>
          <svg className="absolute inset-[-20%] w-[140%] h-[140%] animate-spin text-[#034226] -z-10" style={{ animationDuration: '9s', animationDirection: 'reverse' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="50 150" strokeLinecap="round" />
          </svg>

          {/* Logo */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full shadow-[0_10px_45px_rgba(3,66,38,0.5)] z-10 overflow-hidden bg-[#034226]">
            <img src="/logo.png" alt="GOLI Polla Mundialista" className="w-full h-full object-contain rounded-full" />
          </div>
        </div>

        {/* Loading Bar and Message */}
        <div className="w-64 flex flex-col items-center gap-3">
          <p className="font-sans text-sm font-medium text-slate-300 animate-pulse tracking-wide uppercase text-center">
            {message}
          </p>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-[#e1b12c] to-[#f5d061] transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_1s_infinite]"></div>
            </div>
          </div>
          <p className="font-mono text-xs text-[#e1b12c] font-bold">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
}
