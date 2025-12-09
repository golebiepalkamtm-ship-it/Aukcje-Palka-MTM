'use client';

import Link from 'next/link';
import { memo, ReactNode } from 'react';

interface UnifiedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: `/${string}` | string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  glow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const UnifiedButton = memo(function UnifiedButton({
  children,
  onClick,
  href,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  title,
  ariaLabel,
  glow = false,
  intensity = 'medium',
}: UnifiedButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    glass: 'glass-morphism hover:glass-morphism-strong',
  };

  const buttonClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${glow ? 'animate-glow3D' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover-3d-lift'}
    transform-3d perspective-1000
    ${className}
  `;

  if (href) {
    // Check if it's an external URL (starts with http/https)
    const isExternal = href.startsWith('http://') || href.startsWith('https://');

    if (isExternal) {
      return (
        <a
          href={href}
          title={title}
          aria-label={ariaLabel}
          className={buttonClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="relative z-10">{children}</span>
        </a>
      );
    }

    return (
      <Link
        href={href as `/${string}`}
        title={title}
        aria-label={ariaLabel}
        className={buttonClasses}
      >
        <span className="relative z-10">{children}</span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={buttonClasses}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
});
