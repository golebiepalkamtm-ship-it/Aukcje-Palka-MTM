import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoTooltip({ text, className = '', position = 'top' }: InfoTooltipProps) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-black/90 border-b-transparent border-x-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-black/90 border-t-transparent border-x-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-black/90 border-r-transparent border-y-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-black/90 border-l-transparent border-y-transparent',
  };

  return (
    <div className={`group relative inline-flex items-center ml-2 align-middle ${className}`}>
      <HelpCircle className="w-5 h-5 text-white/50 hover:text-white cursor-help transition-colors" />
      <div
        className={`absolute ${positionClasses[position]} w-80 p-4 bg-black/95 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[999] shadow-xl border border-white/20 text-center leading-relaxed`}
      >
        {text}
        {/* Strzałka */}
        <div className={`absolute border-[6px] ${arrowClasses[position]}`} />
      </div>
    </div>
  );
}

