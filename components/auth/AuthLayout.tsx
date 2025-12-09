import { ReactNode, useState } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4">
      <div
        className="w-full max-w-md shadow-2xl p-8 rounded-3xl border border-white/8"
        style={{
          background: isHovered
            ? 'radial-gradient(circle at 20% 50%, rgba(255,0,0,0.8), transparent 50%), radial-gradient(circle at 80% 50%, rgba(0,0,255,0.8), transparent 50%), radial-gradient(circle at 50% 20%, rgba(0,255,0,0.8), transparent 50%), linear-gradient(45deg, #ffd700, #ffed4e)'
            : 'linear-gradient(45deg, #ffd700, #ffed4e)',
          transition: 'background 0.3s ease',
          boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
    </div>
  );
}
