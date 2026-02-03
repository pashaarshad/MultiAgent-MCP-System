'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';
import type { DeviceMode } from '@/types';

/**
 * ============================================
 * PREVIEW PANEL COMPONENT
 * ============================================
 * Right panel for live preview of generated website
 * 
 * CUSTOMIZATION:
 * - Modify device frame sizes
 * - Change background pattern
 * - Adjust iframe styles
 */

interface PreviewPanelProps {
    html: string;
    css: string;
    js: string;
    deviceMode: DeviceMode;
    onReload?: () => void;
    onOpenInNewTab?: () => void;
}

// Device dimensions
const deviceSizes: Record<DeviceMode, { width: string; height: string }> = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '100%' },
    mobile: { width: '375px', height: '100%' },
};

export function PreviewPanel({
    html,
    css,
    js,
    deviceMode,
    onReload,
    onOpenInNewTab,
}: PreviewPanelProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Generate the full HTML document
    const generateDocument = () => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>
    `.trim();
    };

    // Update iframe content when code changes
    useEffect(() => {
        if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(generateDocument());
                doc.close();
            }
        }
    }, [html, css, js]);

    const handleOpenInNewTab = () => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(generateDocument());
            newWindow.document.close();
        }
    };

    const hasContent = html.trim() || css.trim() || js.trim();

    return (
        <div className="relative h-full bg-[var(--bg-primary)] overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 1px 1px, var(--border-primary) 1px, transparent 0)
          `,
                    backgroundSize: '20px 20px',
                }}
            />

            {/* Preview Container */}
            <div className={cn(
                'relative h-full flex items-start justify-center p-4',
                deviceMode !== 'desktop' && 'py-8'
            )}>
                {hasContent ? (
                    <div
                        className={cn(
                            'bg-white rounded-[var(--radius-lg)] overflow-hidden shadow-2xl',
                            'transition-all duration-[var(--transition-normal)]',
                            deviceMode === 'desktop' && 'w-full h-full',
                            deviceMode === 'tablet' && 'border-8 border-[var(--bg-tertiary)]',
                            deviceMode === 'mobile' && 'border-4 border-[var(--bg-tertiary)] rounded-[24px]'
                        )}
                        style={{
                            width: deviceSizes[deviceMode].width,
                            height: deviceSizes[deviceMode].height,
                            maxWidth: '100%',
                        }}
                    >
                        {/* Device Notch (Mobile) */}
                        {deviceMode === 'mobile' && (
                            <div className="w-full h-6 bg-[var(--bg-tertiary)] flex items-center justify-center">
                                <div className="w-20 h-4 bg-black rounded-full" />
                            </div>
                        )}

                        {/* Iframe */}
                        <iframe
                            ref={iframeRef}
                            title="Preview"
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                ) : (
                    /* Empty State */
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-6">
                            <Globe size={36} className="text-[var(--accent-primary)] opacity-50" />
                        </div>
                        <h3 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-2">
                            No preview yet
                        </h3>
                        <p className="text-[var(--text-sm)] text-[var(--text-muted)] max-w-sm">
                            Start a conversation with the AI to generate your website.
                            The preview will appear here.
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Actions */}
            {hasContent && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {onReload && (
                        <button
                            onClick={onReload}
                            className={cn(
                                'p-2 rounded-[var(--radius-md)]',
                                'bg-[var(--bg-secondary)] border border-[var(--border-primary)]',
                                'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                                'hover:bg-[var(--bg-hover)]',
                                'transition-colors'
                            )}
                            title="Reload preview"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}
                    <button
                        onClick={onOpenInNewTab || handleOpenInNewTab}
                        className={cn(
                            'p-2 rounded-[var(--radius-md)]',
                            'bg-[var(--bg-secondary)] border border-[var(--border-primary)]',
                            'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                            'hover:bg-[var(--bg-hover)]',
                            'transition-colors'
                        )}
                        title="Open in new tab"
                    >
                        <ExternalLink size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default PreviewPanel;
