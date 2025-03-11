
import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className="flex items-center gap-2">
      <svg 
        className={`${className || "h-8 w-8"}`}
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Magnifying Glass */}
        <circle 
          cx="20" 
          cy="20" 
          r="12" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none" 
          className="transition-all duration-300"
        />
        <path 
          d="M28 28L38 38" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        
        {/* Sparkle Effect */}
        <circle cx="16" cy="16" r="1.5" fill="currentColor" className="animate-pulse opacity-80" />
        <circle cx="36" cy="20" r="1" fill="currentColor" className="animate-pulse opacity-60" />
        <circle cx="12" cy="28" r="1" fill="currentColor" className="animate-pulse opacity-60" />
      </svg>
      <span className="font-playfair font-bold text-lg sm:text-xl tracking-tight">Find & Bask</span>
    </div>
  );
};
