'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { enhancePrompt } from '@/lib/api';
import { Button } from '@/components/ui';
import {
    Paperclip,
    Palette,
    MessageSquare,
    Send,
    Sparkles
} from 'lucide-react';

/**
 * ============================================
 * PROMPT INPUT COMPONENT
 * ============================================
 * Main prompt input card for the home page
 * 
 * CUSTOMIZATION:
 * - Modify placeholder text
 * - Add/remove action buttons (Attach, Theme)
 * - Change styling
 */

interface PromptInputProps {
    onSubmit: (prompt: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}

export function PromptInput({
    onSubmit,
    isLoading = false,
    placeholder = 'Describe your website or UI...'
}: PromptInputProps) {
    const [prompt, setPrompt] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    const handleEnhance = async () => {
        if (!prompt.trim()) return;
        setIsEnhancing(true);
        try {
            const enhanced = await enhancePrompt(prompt.trim());
            setPrompt(enhanced);
        } catch (error) {
            console.error("Failed to enhance:", error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div
                className={cn(
                    'relative',
                    'bg-[var(--bg-secondary)]',
                    'border rounded-[var(--radius-xl)]',
                    'transition-all duration-[var(--transition-fast)]',
                    'overflow-hidden',

                    isFocused
                        ? 'border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/10'
                        : 'border-[var(--border-primary)]'
                )}
            >
                {/* Textarea */}
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={isLoading}
                    rows={1}
                    className={cn(
                        'w-full px-5 pt-4 pb-2',
                        'bg-transparent',
                        'text-[var(--text-primary)]',
                        'placeholder:text-[var(--text-muted)]',
                        'text-[var(--text-base)]',
                        'resize-none',
                        'focus:outline-none',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'min-h-[50px] max-h-[200px]'
                    )}
                    style={{
                        height: 'auto',
                        overflow: 'hidden'
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                    }}
                />

                {/* Action Bar */}
                <div className="flex items-center justify-between px-4 pb-3">
                    {/* Left Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5',
                                'rounded-[var(--radius-md)]',
                                'text-[var(--text-sm)] text-[var(--text-muted)]',
                                'hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
                                'transition-colors'
                            )}
                        >
                            <Paperclip size={16} />
                            <span>Attach</span>
                        </button>

                        <button
                            type="button"
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5',
                                'rounded-[var(--radius-md)]',
                                'text-[var(--text-sm)] text-[var(--text-muted)]',
                                'hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
                                'transition-colors'
                            )}
                        >
                            <Palette size={16} />
                            <span>Theme</span>
                        </button>

                        {/* Enhance Prompt Button */}
                        <button
                            type="button"
                            onClick={handleEnhance}
                            disabled={!prompt.trim() || isEnhancing || isLoading}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5',
                                'rounded-[var(--radius-md)]',
                                'text-[var(--text-sm)]',
                                isEnhancing
                                    ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                                    : 'text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10',
                                'transition-colors',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            <Sparkles size={16} className={isEnhancing ? "animate-spin" : ""} />
                            <span>{isEnhancing ? "Enhancing..." : "Enhance"}</span>
                        </button>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!prompt.trim() || isLoading}
                        loading={isLoading}
                    >
                        {isLoading ? (
                            'Generating...'
                        ) : (
                            <>
                                <MessageSquare size={16} />
                                <span>Chat</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Helper Text */}
            <p className="text-center text-[var(--text-xs)] text-[var(--text-muted)] mt-3">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">Enter</kbd> to submit, <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">Shift+Enter</kbd> for new line
            </p>
        </form >
    );
}

export default PromptInput;
