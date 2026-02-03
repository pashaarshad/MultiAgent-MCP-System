'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/types';
import { Loader2 } from 'lucide-react';

/**
 * ============================================
 * BUTTON COMPONENT
 * ============================================
 * Fully customizable button with variants, sizes, and loading state
 * 
 * CUSTOMIZATION:
 * - Change colors in the variant classes below
 * - Modify sizes in the size classes
 * - Adjust border-radius, padding, etc.
 */

const buttonVariants = {
    primary: [
        'bg-[var(--accent-primary)]',
        'text-[var(--text-inverse)]',
        'hover:bg-[var(--accent-secondary)]',
        'active:bg-[var(--accent-tertiary)]',
        'border-transparent',
    ].join(' '),

    secondary: [
        'bg-[var(--bg-tertiary)]',
        'text-[var(--text-primary)]',
        'hover:bg-[var(--bg-hover)]',
        'active:bg-[var(--bg-active)]',
        'border-[var(--border-primary)]',
    ].join(' '),

    ghost: [
        'bg-transparent',
        'text-[var(--text-secondary)]',
        'hover:bg-[var(--bg-hover)]',
        'hover:text-[var(--text-primary)]',
        'active:bg-[var(--bg-active)]',
        'border-transparent',
    ].join(' '),

    danger: [
        'bg-[var(--error)]',
        'text-white',
        'hover:bg-red-600',
        'active:bg-red-700',
        'border-transparent',
    ].join(' '),
};

const buttonSizes = {
    sm: 'h-8 px-3 text-[var(--text-sm)] gap-1.5',
    md: 'h-10 px-4 text-[var(--text-sm)] gap-2',
    lg: 'h-12 px-6 text-[var(--text-base)] gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            children,
            variant = 'primary',
            size = 'md',
            disabled = false,
            loading = false,
            onClick,
            type = 'button',
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                type={type}
                disabled={disabled || loading}
                onClick={onClick}
                className={cn(
                    // Base styles
                    'inline-flex items-center justify-center',
                    'font-medium',
                    'rounded-[var(--radius-md)]',
                    'border',
                    'transition-all duration-[var(--transition-fast)]',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2',
                    'focus-visible:ring-offset-[var(--bg-primary)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'select-none',

                    // Variant styles
                    buttonVariants[variant],

                    // Size styles
                    buttonSizes[size],

                    // Custom className
                    className
                )}
                {...props}
            >
                {loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
