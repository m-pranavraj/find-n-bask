
import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Magnifying Glass */}
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="3" fill="none" />
      <path 
        d="M28 28L38 38" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
    </svg>
  );
};
