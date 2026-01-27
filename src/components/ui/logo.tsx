'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo = ({ className, size = 28 }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-3 group cursor-pointer", className)}>
      {/* Elegant K monogram logo */}
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-white to-zinc-200 transition-all duration-500 group-hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]"
        style={{ width: size, height: size }}
      >
        {/* Stylized K with elegant strokes */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[65%] h-[65%] transition-transform duration-500 group-hover:scale-110"
        >
          {/* Vertical stroke of K */}
          <path
            d="M7 4V20"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          {/* Upper diagonal stroke */}
          <path
            d="M7 12L16 4"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
          />
          {/* Lower diagonal stroke */}
          <path
            d="M7 12L17 20"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300 group-hover:translate-x-[1px] group-hover:translate-y-[1px]"
          />
        </svg>
      </div>
      <span className="font-serif text-2xl tracking-tight text-white flex items-baseline">
        Kam<span className="text-zinc-500 italic font-normal">ForJob</span>
      </span>
    </div>
  );
};

export default Logo;
