import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'stylized' | 'compact';
  className?: string;
  subtitleClassName?: string;
  children?: ReactNode;
}

/**
 * Ujednolicony komponent nagłówka strony
 * 
 * @param title - Główny tytuł strony
 * @param subtitle - Opcjonalny podtytuł/opis
 * @param variant - Wariant stylu: 'default' (standardowy), 'stylized' (stylizowany z uppercase), 'compact' (kompaktowy)
 * @param className - Dodatkowe klasy CSS
 * @param children - Opcjonalna zawartość dodatkowa
 */
export function PageHeader({
  title,
  subtitle,
  variant = 'default',
  className = '',
  subtitleClassName = '',
  children,
}: PageHeaderProps) {
  const baseClasses = 'page-title font-bold text-white/45 mb-4';
  
  const variantClasses = {
    default: 'text-4xl',
    stylized: 'text-4xl uppercase text-white/30 mb-6',
    compact: 'text-3xl mb-4',
  };

  const titleClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <div className="text-center mb-12">
      <h1 className={titleClasses}>{title}</h1>
      {subtitle && (
        <p
          className={`text-xl ${
            variant === 'stylized' ? 'text-white/95' : 'text-white'
          } ${variant === 'stylized' ? 'mb-8 max-w-3xl mx-auto' : ''} ${subtitleClassName}`.trim()}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

