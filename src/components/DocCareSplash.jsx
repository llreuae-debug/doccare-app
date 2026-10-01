import React, { useState, useEffect } from 'react';

/**
 * DocCareSplash - Official Minimalist Medical Startup Screen
 * 
 * Implements the official gentle & minimal animation sequence:
 * 1. Clean pure white background.
 * 2. Logo fades in softly (opacity: 0 -> 1).
 * 3. Logo gently scales from ~94% -> 100%.
 * 4. Very subtle glow/pulse.
 * 5. Logo settles cleanly.
 * 6. Application initializes smoothly (~1.8s minimum presentation time).
 * 7. Smooth exit transition into Welcome/Login screen.
 * 
 * Supports: prefers-reduced-motion: reduce (instant/subtle fade, no scale).
 */
export default function DocCareSplash({ onComplete }) {
  const [stage, setStage] = useState(0); // 0 = Init White, 1 = Soft Fade & Scale In, 2 = Settle & Glow, 3 = Ready
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setStage(2);
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Step 2 & 3: Logo fades in softly & scales 94% -> 100% (after 100ms)
    const t1 = setTimeout(() => setStage(1), 100);

    // Step 4 & 5: Subtle glow & settle (after 750ms)
    const t2 = setTimeout(() => setStage(2), 750);

    // Step 6 & 7: Smooth transition out into application (after 1800ms)
    const t3 = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 450);
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white cursor-pointer select-none transition-opacity duration-500 ease-out ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: '#ffffff',
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
      }}
      aria-label="DocCare Loading Screen"
      role="status"
    >
      {/* Centered Master Logo Container with Safe-Area Viewport Fit */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 max-w-sm w-full">
        
        {/* Logo Image with Soft Scale & Fade */}
        <div
          className="relative flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1 ? 'scale(1)' : 'scale(0.94)'
          }}
        >
          {/* Subtle Medical Ambient Glow */}
          <div 
            className={`absolute inset-0 bg-teal-500/10 rounded-full blur-2xl transform scale-110 -z-10 transition-opacity duration-1000 ${
              stage >= 2 ? 'opacity-100' : 'opacity-0'
            }`} 
          />

          <img
            src="/brand/doccare-logo.png"
            alt="DocCare"
            className="w-[clamp(130px,38vw,200px)] max-w-[80vw] max-h-[30vh] object-contain shrink-0 drop-shadow-sm transition-all duration-500"
            loading="eager"
          />
        </div>

        {/* Minimalist Subtext */}
        <div
          className="mt-4 transition-all duration-500 ease-out"
          style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? 'translateY(0px)' : 'translateY(6px)'
          }}
        >
          <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-tight leading-relaxed">
            Your practice. Your patients. One simple record.
          </p>
        </div>

        {/* Subtle Minimal Loading Indicator */}
        <div
          className="mt-6 w-32 h-1 bg-slate-100 rounded-full overflow-hidden transition-opacity duration-500 shadow-inner"
          style={{ opacity: stage >= 1 ? 1 : 0 }}
        >
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-teal-600 rounded-full transition-all duration-[1400ms] ease-out"
            style={{ width: stage >= 2 ? '100%' : '30%' }}
          />
        </div>

      </div>
    </div>
  );
}

