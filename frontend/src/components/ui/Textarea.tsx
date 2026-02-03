'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TextareaProps } from '@/types';

/**
 * ============================================
 * TEXTAREA COMPONENT
 * ============================================
 * Customizable textarea with label and error states
 * 
 * CUSTOMIZATION:
 * - Change colors in CSS variables
 * - Adjust min-height, resize behavior, etc.
 */

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            className,
            error,
            label,
            id,
            ...props
        },
        ref
    ) => {
        const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn(
                        // Base styles
                        'w-full min-h-[100px]',
                        'bg-[var(--bg-tertiary)]',
                        'text-[var(--text-primary)]',
                        'placeholder:text-[var(--text-muted)]',
                        'border border-[var(--border-primary)]',
                        'rounded-[var(--radius-md)]',
                        'px-4 py-3',
                        'text-[var(--text-sm)]',
                        'transition-all duration-[var(--transition-fast)]',
                        'resize-y',

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

Textarea.displayName = 'Textarea';

export default Textarea;
