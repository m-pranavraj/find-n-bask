
import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, showText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-md opacity-70 animate-pulse"></div>
        <svg 
          className={`${className || "h-8 w-8"} relative z-10`}
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Background */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          
          {/* Colored Circle Background */}
          <circle 
            cx="20" 
            cy="20" 
            r="16" 
            fill="url(#logoGradient)" 
            opacity="0.2"
          />
          
          {/* Magnifying Glass */}
          <circle 
            cx="20" 
            cy="20" 
            r="12" 
            stroke="url(#logoGradient)" 
            strokeWidth="3" 
            fill="none" 
            className="transition-all duration-300"
          />
          <path 
            d="M28 28L38 38" 
            stroke="url(#logoGradient)" 
            strokeWidth="4" 
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          
          {/* Sparkle Effect */}
          <circle cx="15" cy="16" r="1.5" fill="currentColor" className="animate-pulse opacity-80" />
          <circle cx="25" cy="18" r="1" fill="currentColor" className="animate-pulse opacity-70" />
          <circle cx="18" cy="25" r="1" fill="currentColor" className="animate-pulse opacity-60" />
        </svg>
      </div>
      {showText && (
        <span className="font-playfair font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Find & Bask
        </span>
      )}
    </div>
  );
};
