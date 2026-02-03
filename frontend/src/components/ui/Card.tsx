'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { BaseComponentProps } from '@/types';

/**
 * ============================================
 * CARD COMPONENT
 * ============================================
 * Flexible card container with customizable variants
 * 
 * CUSTOMIZATION:
 * - Change background, border, shadow in variants
 * - Adjust padding in the padding prop
 * - Modify border-radius
 */

interface CardProps extends BaseComponentProps {
    variant?: 'default' | 'bordered' | 'elevated' | 'ghost';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    onClick?: () => void;
}

const cardVariants = {
    default: [
        'bg-[var(--bg-secondary)]',
        'border-transparent',
    ].join(' '),

    bordered: [
        'bg-[var(--bg-secondary)]',
        'border-[var(--border-primary)]',
    ].join(' '),

    elevated: [
        'bg-[var(--bg-secondary)]',
        'border-[var(--border-primary)]',
        'shadow-[var(--shadow-md)]',
    ].join(' '),

    ghost: [
        'bg-transparent',
        'border-transparent',
    ].join(' '),
};

const cardPadding = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            children,
            variant = 'bordered',
            padding = 'md',
            hover = false,
            onClick,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                onClick={onClick}
                className={cn(
                    // Base styles
                    'rounded-[var(--radius-lg)]',
                    'border',
                    'transition-all duration-[var(--transition-fast)]',

                    // Variant
                    cardVariants[variant],

                    // Padding
                    cardPadding[padding],

                    // Hover effect
                    hover && [
                        'cursor-pointer',
                        'hover:border-[var(--border-secondary)]',
                        'hover:bg-[var(--bg-hover)]',
                    ].join(' '),

                    // Clickable
                    onClick && 'cursor-pointer',

                    // Custom
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card Header
export const CardHeader = React.forwardRef<
    HTMLDivElement,
    BaseComponentProps
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col gap-1.5', className)}
        {...props}
    >
        {children}
    </div>
));
CardHeader.displayName = 'CardHeader';

// Card Title
export const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    BaseComponentProps
>(({ className, children, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            'text-[var(--text-lg)] font-semibold text-[var(--text-primary)]',
            className
        )}
        {...props}
    >
        {children}
    </h3>
));
CardTitle.displayName = 'CardTitle';

// Card Description
export const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    BaseComponentProps
>(({ className, children, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-[var(--text-sm)] text-[var(--text-secondary)]', className)}
        {...props}
    >
        {children}
    </p>
));
CardDescription.displayName = 'CardDescription';

// Card Content
export const CardContent = React.forwardRef<
    HTMLDivElement,
    BaseComponentProps
>(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
        {children}
    </div>
));
CardContent.displayName = 'CardContent';

// Card Footer
export const CardFooter = React.forwardRef<
    HTMLDivElement,
    BaseComponentProps
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center gap-2 pt-4', className)}
        {...props}
    >
        {children}
    </div>
));
CardFooter.displayName = 'CardFooter';

export default Card;
