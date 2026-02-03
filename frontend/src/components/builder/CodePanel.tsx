'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils';
import { Copy, Check, FileCode, FileType, Braces, Download } from 'lucide-react';

/**
 * ============================================
 * CODE PANEL COMPONENT
 * ============================================
 * Right panel for viewing generated code with syntax highlighting
 * 
 * CUSTOMIZATION:
 * - Modify tab styles
 * - Change code colors
 * - Add more file types
 */

interface CodePanelProps {
    html: string;
    css: string;
    js: string;
    onDownload?: () => void;
}

type CodeTab = 'html' | 'css' | 'js';

const tabs: Array<{ id: CodeTab; label: string; icon: React.ElementType }> = [
    { id: 'html', label: 'HTML', icon: FileCode },
    { id: 'css', label: 'CSS', icon: FileType },
    { id: 'js', label: 'JavaScript', icon: Braces },
];

export function CodePanel({ html, css, js, onDownload }: CodePanelProps) {
    const [activeTab, setActiveTab] = useState<CodeTab>('html');
    const [copied, setCopied] = useState(false);

    const getCode = () => {
        switch (activeTab) {
            case 'html': return html;
            case 'css': return css;
            case 'js': return js;
            default: return '';
        }
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(getCode());
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const currentCode = getCode();

    return (
        <div className="flex flex-col h-full bg-[var(--bg-secondary)]">
            {/* Tab Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-primary)]">
                {/* Tabs */}
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)]',
                                    'text-[var(--text-sm)] font-medium',
                                    'transition-colors duration-[var(--transition-fast)]',

                                    activeTab === tab.id
                                        ? 'text-[var(--text-primary)] bg-[var(--bg-tertiary)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                                )}
                            >
                                <Icon size={14} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        disabled={!currentCode}
                        className={cn(
                            'flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)]',
                            'text-[var(--text-sm)] text-[var(--text-muted)]',
                            'hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
                            'transition-colors',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        {copied ? (
                            <>
                                <Check size={14} className="text-[var(--success)]" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                <span>Copy</span>
                            </>
                        )}
                    </button>

                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className={cn(
                                'flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)]',
                                'text-[var(--text-sm)] text-[var(--text-muted)]',
                                'hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
                                'transition-colors'
                            )}
                        >
                            <Download size={14} />
                            <span>Download</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Code Display */}
            <div className="flex-1 overflow-auto p-4">
                {currentCode ? (
                    <pre className={cn(
                        'text-[var(--text-sm)] font-mono',
                        'text-[var(--text-primary)]',
                        'leading-relaxed',
                        'whitespace-pre-wrap break-words'
                    )}>
                        <code>
                            {highlightCode(currentCode, activeTab)}
                        </code>
                    </pre>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                            <FileCode size={28} className="text-[var(--text-muted)]" />
                        </div>
                        <h3 className="text-[var(--text-base)] font-medium text-[var(--text-primary)] mb-2">
                            No code yet
                        </h3>
                        <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                            Generated code will appear here.
                        </p>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-primary)] text-[var(--text-xs)] text-[var(--text-muted)]">
                <span>{activeTab.toUpperCase()}</span>
                <span>{currentCode.split('\n').length} lines</span>
            </div>
        </div>
    );
}

// Simple syntax highlighting (basic version)
function highlightCode(code: string, language: CodeTab): React.ReactNode {
    // This is a simplified version. In production, use a library like Prism.js or highlight.js

    const lines = code.split('\n');

    return lines.map((line, index) => (
        <div key={index} className="flex">
            <span className="select-none w-12 text-right pr-4 text-[var(--text-muted)] opacity-50">
                {index + 1}
            </span>
            <span className="flex-1">
                {highlightLine(line, language)}
            </span>
        </div>
    ));
}

function highlightLine(line: string, language: CodeTab): React.ReactNode {
    // Basic keyword highlighting
    const keywords: Record<CodeTab, string[]> = {
        html: ['<!DOCTYPE', '<html', '</html>', '<head', '</head>', '<body', '</body>', '<div', '</div>', '<span', '</span>', '<p', '</p>', '<a', '</a>', '<h1', '</h1>', '<h2', '</h2>', '<h3', '</h3>', '<img', '<script', '</script>', '<style', '</style>', '<link', '<meta'],
        css: ['@import', '@media', '@keyframes', 'color', 'background', 'padding', 'margin', 'display', 'flex', 'grid', 'position', 'width', 'height', 'border', 'font', 'text', 'transition', 'transform', 'animation'],
        js: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'class', 'extends', 'new', 'this', 'async', 'await', 'try', 'catch', 'throw'],
    };

    let result = line;

    // Highlight strings
    result = result.replace(/(["'`])(.*?)\1/g, '<span class="text-[var(--warning)]">$&</span>');

    // Highlight comments
    if (language === 'html' && line.includes('<!--')) {
        result = result.replace(/(<!--.*?-->)/g, '<span class="text-[var(--text-muted)]">$1</span>');
    } else if ((language === 'css' || language === 'js') && line.includes('//')) {
        result = result.replace(/(\/\/.*$)/g, '<span class="text-[var(--text-muted)]">$1</span>');
    }

    // This is a simple implementation - for real syntax highlighting, use a proper library
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

export default CodePanel;
