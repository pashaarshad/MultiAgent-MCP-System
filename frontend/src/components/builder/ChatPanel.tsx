'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Send, User, Bot, Copy, Check } from 'lucide-react';
import type { Message } from '@/types';

/**
 * ============================================
 * CHAT PANEL COMPONENT
 * ============================================
 * Left panel for chat interaction with the AI
 * 
 * CUSTOMIZATION:
 * - Modify message bubble styles
 * - Change input area
 * - Add more actions
 */

interface ChatPanelProps {
    messages: Message[];
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
}

export function ChatPanel({
    messages,
    onSendMessage,
    isLoading = false
}: ChatPanelProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-secondary)]">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent-muted)] flex items-center justify-center mb-4">
                            <Bot size={24} className="text-[var(--accent-primary)]" />
                        </div>
                        <h3 className="text-[var(--text-base)] font-medium text-[var(--text-primary)] mb-2">
                            Start a conversation
                        </h3>
                        <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                            Describe what you want to build or ask for modifications.
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-muted)] flex items-center justify-center flex-shrink-0">
                            <Bot size={16} className="text-[var(--accent-primary)]" />
                        </div>
                        <div className="flex-1 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-tertiary)]">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border-primary)]">
                <div className={cn(
                    'flex items-end gap-2 p-2',
                    'bg-[var(--bg-tertiary)]',
                    'border border-[var(--border-primary)]',
                    'rounded-[var(--radius-lg)]',
                    'focus-within:border-[var(--accent-primary)]',
                    'transition-colors'
                )}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask for changes or describe what you want..."
                        disabled={isLoading}
                        rows={1}
                        className={cn(
                            'flex-1 px-2 py-1',
                            'bg-transparent',
                            'text-[var(--text-primary)]',
                            'placeholder:text-[var(--text-muted)]',
                            'text-[var(--text-sm)]',
                            'resize-none',
                            'focus:outline-none',
                            'disabled:opacity-50',
                            'min-h-[32px] max-h-[120px]'
                        )}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                        }}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!input.trim() || isLoading}
                        className="flex-shrink-0"
                    >
                        <Send size={16} />
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn(
            'flex items-start gap-3',
            isUser && 'flex-row-reverse'
        )}>
            {/* Avatar */}
            <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                isUser ? 'bg-[var(--bg-tertiary)]' : 'bg-[var(--accent-muted)]'
            )}>
                {isUser ? (
                    <User size={16} className="text-[var(--text-secondary)]" />
                ) : (
                    <Bot size={16} className="text-[var(--accent-primary)]" />
                )}
            </div>

            {/* Message Content */}
            <div className={cn(
                'group relative flex-1 max-w-[85%] p-3 rounded-[var(--radius-lg)]',
                isUser
                    ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            )}>
                <p className="text-[var(--text-sm)] whitespace-pre-wrap break-words">
                    {message.content}
                </p>

                {/* Copy Button */}
                {!isUser && (
                    <button
                        onClick={handleCopy}
                        className={cn(
                            'absolute top-2 right-2',
                            'p-1 rounded-[var(--radius-sm)]',
                            'text-[var(--text-muted)]',
                            'opacity-0 group-hover:opacity-100',
                            'hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
                            'transition-all'
                        )}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ChatPanel;
