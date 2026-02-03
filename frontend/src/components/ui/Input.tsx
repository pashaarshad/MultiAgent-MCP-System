'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { InputProps } from '@/types';

/**
 * ============================================
 * INPUT COMPONENT
 * ============================================
 * Customizable text input with label and error states
 * 
 * CUSTOMIZATION:
 * - Change colors in CSS variables
 * - Modify sizes in inputSizes
 * - Adjust focus ring, padding, etc.
 */

const inputSizes = {
    sm: 'h-8 px-3 text-[var(--text-sm)]',
    md: 'h-10 px-4 text-[var(--text-sm)]',
    lg: 'h-12 px-4 text-[var(--text-base)]',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            size = 'md',
            error,
            label,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        // Base styles
                        'w-full',
                        'bg-[var(--bg-tertiary)]',
                        'text-[var(--text-primary)]',
                        'placeholder:text-[var(--text-muted)]',
                        'border border-[var(--border-primary)]',
                        'rounded-[var(--radius-md)]',
                        'transition-all duration-[var(--transition-fast)]',

                        // Focus states
                        'focus:outline-none',
                        'focus:border-[var(--accent-primary)]',
                        'focus:ring-1 focus:ring-[var(--accent-primary)]',

                        // Hover
                        'hover:border-[var(--border-secondary)]',

                        // Disabled
                        'disabled:opacity-50 disabled:cursor-not-allowed',

                        // Error state
                        error && 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]',

                        // Size
                        inputSizes[size],

                        // Custom
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-[var(--text-xs)] text-[var(--error)]">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
