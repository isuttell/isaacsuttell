import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
    secondary: 'border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-900',
    ghost: 'hover:bg-neutral-100 text-neutral-900',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
