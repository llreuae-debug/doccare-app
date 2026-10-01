import React, { useState } from 'react';

/**
 * DocCareLogo - Master Single Source of Truth Brand Component
 * 
 * Uses the official DocCare master logo artwork across all viewports and portals.
 * Strictly maintains aspect-ratio, prevents cropping, distortion, and horizontal scroll.
 *
 * @param {('full'|'horizontal'|'compact'|'icon'|'wordmark')} variant
 * @param {('xs'|'sm'|'md'|'lg'|'xl'|'2xl')} size
 * @param {string} className
 * @param {boolean} showTagline
 * @param {boolean} animated
 * @param {string} alt
 */
export default function DocCareLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true,
  animated = true,
  alt = 'DocCare — Your Practice. Your Patients. One Simple Record.'
}) {
  const [imgError, setImgError] = useState(false);

  // Responsive size mapping for icon & logo images
  const sizeConfig = {
    xs: {
      icon: 'w-6 h-6',
      logo: 'h-6 max-w-[120px]',
      text: 'text-sm',
      tagline: 'text-[9px]'
    },
    sm: {
      icon: 'w-8 h-8',
      logo: 'h-8 max-w-[140px]',
      text: 'text-base',
      tagline: 'text-[10px]'
    },
    md: {
      icon: 'w-9 h-9 sm:w-10 sm:h-10',
      logo: 'h-9 sm:h-10 max-w-[170px]',
      text: 'text-lg sm:text-xl',
      tagline: 'text-[11px]'
    },
    lg: {
      icon: 'w-12 h-12 sm:w-14 sm:h-14',
      logo: 'h-12 sm:h-14 max-w-[200px]',
      text: 'text-2xl sm:text-3xl',
      tagline: 'text-xs sm:text-sm'
    },
    xl: {
      icon: 'w-16 h-16 sm:w-20 sm:h-20',
      logo: 'h-16 sm:h-20 max-w-[260px]',
      text: 'text-3xl sm:text-4xl',
      tagline: 'text-sm'
    },
    '2xl': {
      icon: 'w-24 h-24 sm:w-28 sm:h-28',
      logo: 'h-24 sm:h-28 max-w-[320px]',
      text: 'text-4xl sm:text-5xl',
      tagline: 'text-base'
    }
  };

  const currentConfig = sizeConfig[size] || sizeConfig.md;

  // Render official master icon
  const renderMasterIcon = (extraClass = '') => {
    return (
      <div 
        className={`relative shrink-0 flex items-center justify-center select-none ${
          animated ? 'logo-glow-hover group' : ''
        } ${extraClass}`}
      >
        {!imgError ? (
          <img
            src="/brand/doccare-icon.png"
            onError={() => setImgError(true)}
            alt={alt}
            className={`${currentConfig.icon} object-contain shrink-0 drop-shadow-xs transition-transform duration-300 ${
              animated ? 'group-hover:scale-105' : ''
            }`}
            loading="eager"
          />
        ) : (
          <div className={`${currentConfig.icon} rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-400 p-2 text-white shadow-md shadow-teal-600/20 flex items-center justify-center`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  // 1. Icon Only Variant
  if (variant === 'icon') {
    return renderMasterIcon(className);
  }

  // 2. Wordmark Only Variant
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center tracking-tight select-none font-extrabold ${currentConfig.text} ${className}`}>
        <span className="text-slate-900 dark:text-white">Doc</span>
        <span className="text-teal-600 dark:text-teal-400">Care</span>
      </div>
    );
  }

  // 3. Full Centered Variant (for Login / Auth screens / Welcome)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${animated ? 'animate-logo-entrance' : ''} ${className}`}>
        <div className="relative mb-2 flex items-center justify-center">
          <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-xl transform scale-125 -z-10" />
          <img
            src="/brand/doccare-logo.png"
            alt={alt}
            className="w-[clamp(130px,38vw,190px)] max-w-[80vw] max-h-[28vh] object-contain shrink-0 drop-shadow-sm transition-transform duration-300"
            loading="eager"
          />
        </div>
        {showTagline && (
          <p className={`font-medium text-slate-500 dark:text-slate-400 mt-1 tracking-tight leading-tight max-w-xs ${currentConfig.tagline}`}>
            Your Practice. Your Patients. One Simple Record.
          </p>
        )}
      </div>
    );
  }

  // 4. Compact Variant (Icon + Clean Title)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 select-none ${animated ? 'logo-glow-hover' : ''} ${className}`}>
        {renderMasterIcon()}
        <span className={`font-extrabold tracking-tight leading-none ${currentConfig.text}`}>
          <span className="text-slate-900 dark:text-white">Doc</span>
          <span className="text-teal-600 dark:text-teal-400">Care</span>
        </span>
      </div>
    );
  }

  // 5. Default: Horizontal Layout (Icon + Title + Subtitle)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${animated ? 'logo-glow-hover group' : ''} ${className}`}>
      {renderMasterIcon()}
      <div className="flex flex-col justify-center">
        <div className={`font-extrabold tracking-tight leading-none flex items-center ${currentConfig.text}`}>
          <span className="text-slate-900 dark:text-white">Doc</span>
          <span className="text-teal-600 dark:text-teal-400">Care</span>
        </div>
        {showTagline && (
          <span className={`font-medium text-slate-500 dark:text-slate-400 tracking-tight leading-none mt-1 hidden sm:block ${currentConfig.tagline}`}>
            Your Practice. Your Patients. One Simple Record.
          </span>
        )}
      </div>
    </div>
  );
}
