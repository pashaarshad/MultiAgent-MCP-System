'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Home,
    Search,
    FolderOpen,
    Settings,
    Crown,
    ChevronLeft,
    ChevronRight,
    Globe,
    User
} from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * ============================================
 * SIDEBAR COMPONENT
 * ============================================
 * Collapsible sidebar with navigation and recent projects
 * 
 * CUSTOMIZATION:
 * - Modify width in CSS variables (--sidebar-width)
 * - Change navigation items below
 * - Adjust colors in globals.css
 */

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    recentProjects?: Array<{
        id: string;
        name: string;
    }>;
    userName?: string;
}

// Navigation items - CUSTOMIZE HERE
const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
];

export function Sidebar({
    isOpen,
    onToggle,
    recentProjects = [],
    userName = 'User'
}: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    // Base styles
                    'fixed top-0 left-0 h-full z-50',
                    'bg-[var(--bg-secondary)]',
                    'border-r border-[var(--border-primary)]',
                    'flex flex-col',
                    'transition-all duration-[var(--transition-normal)]',

                    // Width based on state
                    isOpen ? 'w-[var(--sidebar-width)]' : 'w-0 lg:w-[var(--sidebar-collapsed-width)]',

                    // Hide overflow when collapsed
                    !isOpen && 'overflow-hidden lg:overflow-visible'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-[var(--header-height)] px-4 border-b border-[var(--border-primary)]">
                    <Link
                        href="/"
                        className={cn(
                            'flex items-center gap-2 transition-opacity',
                            !isOpen && 'lg:opacity-0'
                        )}
                    >
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
                            <span className="text-[var(--text-inverse)] font-bold text-sm">M</span>
                        </div>
                        <span className="font-semibold text-[var(--text-primary)] whitespace-nowrap">
                            MCP Builder
                        </span>
                    </Link>

                    {/* Toggle Button - Desktop */}
                    <button
                        onClick={onToggle}
                        className={cn(
                            'hidden lg:flex items-center justify-center',
                            'w-6 h-6 rounded-md',
                            'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                            'hover:bg-[var(--bg-hover)]',
                            'transition-colors'
                        )}
                    >
                        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className={cn('flex-1 py-4 overflow-y-auto', !isOpen && 'lg:py-2')}>
                    {/* Main Nav */}
                    <div className="px-3 mb-6">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)]',
                                        'text-[var(--text-sm)]',
                                        'transition-colors duration-[var(--transition-fast)]',

                                        isActive
                                            ? 'bg-[var(--accent-muted)] text-[var(--accent-primary)]'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',

                                        !isOpen && 'lg:justify-center lg:px-2'
                                    )}
                                >
                                    <Icon size={18} />
                                    <span className={cn(!isOpen && 'lg:hidden')}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Recent Projects */}
                    <div className={cn('px-3', !isOpen && 'lg:hidden')}>
                        <div className="flex items-center gap-2 px-3 mb-2">
                            <span className="text-[var(--text-xs)] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                Projects
                            </span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 text-[var(--text-sm)] text-[var(--text-secondary)]">
                            <FolderOpen size={16} />
                            <span>Recent</span>
                        </div>

                        {recentProjects.length > 0 ? (
                            <div className="space-y-1 ml-4 pl-3 border-l border-[var(--border-primary)]">
                                {recentProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/builder/${project.id}`}
                                        className={cn(
                                            'block px-2 py-1.5 rounded-[var(--radius-sm)]',
                                            'text-[var(--text-sm)] text-[var(--text-muted)]',
                                            'hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
                                            'truncate',
                                            'transition-colors'
                                        )}
                                    >
                                        {project.name}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="px-3 py-2 text-[var(--text-xs)] text-[var(--text-muted)]">
                                No recent projects
                            </div>
                        )}
                    </div>
                </nav>

                {/* Footer */}
                <div className={cn(
                    'p-3 border-t border-[var(--border-primary)]',
                    !isOpen && 'lg:p-2'
                )}>
                    {/* Upgrade Card */}
                    <div className={cn(
                        'p-3 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] mb-3',
                        !isOpen && 'lg:hidden'
                    )}>
                        <div className="flex items-center gap-2 mb-2">
                            <Crown size={16} className="text-[var(--warning)]" />
                            <span className="text-[var(--text-sm)] font-medium">Upgrade to Pro</span>
                        </div>
                        <p className="text-[var(--text-xs)] text-[var(--text-muted)] mb-3">
                            Unlock more features and high-speed generation.
                        </p>
                        <Button size="sm" className="w-full">
                            Upgrade Now
                        </Button>
                    </div>

                    {/* User Menu */}
                    <div className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)]',
                        'hover:bg-[var(--bg-hover)] cursor-pointer',
                        'transition-colors',
                        !isOpen && 'lg:justify-center lg:px-2'
                    )}>
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <User size={16} className="text-[var(--text-muted)]" />
                        </div>
                        <span className={cn(
                            'text-[var(--text-sm)] text-[var(--text-primary)]',
                            !isOpen && 'lg:hidden'
                        )}>
                            {userName}
                        </span>
                        <Settings
                            size={16}
                            className={cn(
                                'ml-auto text-[var(--text-muted)]',
                                !isOpen && 'lg:hidden'
                            )}
                        />
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
