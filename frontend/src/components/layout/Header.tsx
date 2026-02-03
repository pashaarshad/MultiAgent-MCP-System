'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
    Menu,
    Eye,
    Code,
    Monitor,
    Tablet,
    Smartphone,
    RefreshCw,
    Download,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { ViewMode, DeviceMode } from '@/types';

/**
 * ============================================
 * HEADER COMPONENT
 * ============================================
 * Top header bar with view toggles and actions
 * 
 * CUSTOMIZATION:
 * - Modify height in CSS variables (--header-height)
 * - Change button styles in Button component
 * - Add/remove action buttons below
 */

interface HeaderProps {
    sidebarOpen: boolean;
    onMenuClick: () => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    deviceMode: DeviceMode;
    onDeviceModeChange: (mode: DeviceMode) => void;
    isGenerating?: boolean;
    onReload?: () => void;
    onExport?: () => void;
    onOpenInNewTab?: () => void;
    showViewControls?: boolean;
    projectName?: string;
}

export function Header({
    sidebarOpen,
    onMenuClick,
    viewMode,
    onViewModeChange,
    deviceMode,
    onDeviceModeChange,
    isGenerating = false,
    onReload,
    onExport,
    onOpenInNewTab,
    showViewControls = true,
    projectName = 'Multi-Agent MCP System'
}: HeaderProps) {
    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-30',
                'h-[var(--header-height)]',
                'bg-[var(--bg-primary)]',
                'border-b border-[var(--border-primary)]',
                'flex items-center justify-between',
                'px-4',
                'transition-all duration-[var(--transition-normal)]',

                // Adjust width based on sidebar
                sidebarOpen
                    ? 'left-[var(--sidebar-width)]'
                    : 'left-0 lg:left-[var(--sidebar-collapsed-width)]'
            )}
        >
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className={cn(
                        'lg:hidden flex items-center justify-center',
                        'w-10 h-10 rounded-[var(--radius-md)]',
                        'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                        'hover:bg-[var(--bg-hover)]',
                        'transition-colors'
                    )}
                >
                    <Menu size={20} />
                </button>

                {/* View Mode Toggle */}
                {showViewControls && (
                    <div className="flex items-center bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-1">
                        <button
                            onClick={() => onViewModeChange('preview')}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)]',
                                'text-[var(--text-sm)] font-medium',
                                'transition-colors duration-[var(--transition-fast)]',

                                viewMode === 'preview'
                                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            )}
                        >
                            <Eye size={16} />
                            <span className="hidden sm:inline">Preview</span>
                        </button>
                        <button
                            onClick={() => onViewModeChange('code')}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)]',
                                'text-[var(--text-sm)] font-medium',
                                'transition-colors duration-[var(--transition-fast)]',

                                viewMode === 'code'
                                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            )}
                        >
                            <Code size={16} />
                            <span className="hidden sm:inline">Code</span>
                        </button>
                    </div>
                )}

                {/* Device Mode Toggle */}
                {showViewControls && (
                    <div className="hidden md:flex items-center gap-1 bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-1">
                        <button
                            onClick={() => onDeviceModeChange('desktop')}
                            className={cn(
                                'p-2 rounded-[var(--radius-sm)]',
                                'transition-colors duration-[var(--transition-fast)]',

                                deviceMode === 'desktop'
                                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            )}
                            title="Desktop view"
                        >
                            <Monitor size={16} />
                        </button>
                        <button
                            onClick={() => onDeviceModeChange('tablet')}
                            className={cn(
                                'p-2 rounded-[var(--radius-sm)]',
                                'transition-colors duration-[var(--transition-fast)]',

                                deviceMode === 'tablet'
                                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            )}
                            title="Tablet view"
                        >
                            <Tablet size={16} />
                        </button>
                        <button
                            onClick={() => onDeviceModeChange('mobile')}
                            className={cn(
                                'p-2 rounded-[var(--radius-sm)]',
                                'transition-colors duration-[var(--transition-fast)]',

                                deviceMode === 'mobile'
                                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            )}
                            title="Mobile view"
                        >
                            <Smartphone size={16} />
                        </button>
                    </div>
                )}

                {/* Project Name - Mobile */}
                {!showViewControls && (
                    <span className="text-[var(--text-primary)] font-semibold">
                        {projectName}
                    </span>
                )}
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-2">
                {/* Status Indicator */}
                {isGenerating && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--accent-muted)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                        <span className="text-[var(--text-sm)] text-[var(--accent-primary)]">
                            Generating...
                        </span>
                    </div>
                )}

                {/* Reload Button */}
                {onReload && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onReload}
                        disabled={isGenerating}
                        className="hidden sm:flex"
                    >
                        <RefreshCw size={16} />
                        <span className="hidden lg:inline">Reload</span>
                    </Button>
                )}

                {/* Open in New Tab */}
                {onOpenInNewTab && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onOpenInNewTab}
                        className="hidden sm:flex"
                        title="Open in new tab"
                    >
                        <ExternalLink size={16} />
                    </Button>
                )}

                {/* Export Button */}
                {onExport && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onExport}
                        disabled={isGenerating}
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                )}
            </div>
        </header>
    );
}

export default Header;
