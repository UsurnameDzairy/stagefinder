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
      <div 
        className="relative flex items-center justify-center overflow-hidden rounded-md bg-white transition-all duration-500 group-hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        style={{ width: size, height: size }}
      >
        <div className="flex h-full w-full flex-col justify-center items-center gap-[2.5px] p-[5px]">
          <div className="h-[1.5px] w-full bg-black rounded-full transition-transform duration-500 group-hover:translate-x-0.5" />
          <div className="h-[1.5px] w-[75%] bg-black rounded-full self-start transition-transform duration-500 group-hover:translate-x-1" />
          <div className="h-[1.5px] w-full bg-black rounded-full transition-transform duration-500 group-hover:-translate-x-0.5" />
        </div>
      </div>
      <span className="font-serif text-2xl tracking-tight text-white flex items-baseline">
        Kam<span className="text-zinc-500 italic font-normal">ForJob</span>
      </span>
    </div>
  );
};

export default Logo;
