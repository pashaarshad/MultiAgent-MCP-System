'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeDate, truncate } from '@/lib/utils';
import { Globe, MoreVertical } from 'lucide-react';
import type { Project } from '@/types';

/**
 * ============================================
 * PROJECT CARD COMPONENT
 * ============================================
 * Card for displaying a project in the gallery
 * 
 * CUSTOMIZATION:
 * - Modify card dimensions
 * - Change hover effects
 * - Add/remove information displayed
 */

interface ProjectCardProps {
    project: Project;
    onOptionsClick?: (projectId: string) => void;
}

export function ProjectCard({ project, onOptionsClick }: ProjectCardProps) {
    return (
        <Link
            href={`/builder/${project.id}`}
            className={cn(
                'group relative',
                'block p-4',
                'bg-[var(--bg-secondary)]',
                'border border-[var(--border-primary)]',
                'rounded-[var(--radius-lg)]',
                'transition-all duration-[var(--transition-fast)]',
                'hover:border-[var(--border-secondary)]',
                'hover:bg-[var(--bg-hover)]',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--accent-primary)]'
            )}
        >
            {/* Thumbnail */}
            <div
                className={cn(
                    'aspect-[4/3] mb-3',
                    'bg-[var(--bg-tertiary)]',
                    'rounded-[var(--radius-md)]',
                    'flex items-center justify-center',
                    'overflow-hidden'
                )}
            >
                {project.thumbnail ? (
                    <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Globe
                        size={32}
                        className="text-[var(--accent-primary)] opacity-50"
                    />
                )}
            </div>

            {/* Info */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] truncate">
                        {truncate(project.name, 25)}
                    </h3>
                    <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
                        {formatRelativeDate(project.updatedAt)}
                    </p>
                </div>

                {/* Options Button */}
                {onOptionsClick && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onOptionsClick(project.id);
                        }}
                        className={cn(
                            'p-1.5 rounded-[var(--radius-sm)]',
                            'text-[var(--text-muted)]',
                            'opacity-0 group-hover:opacity-100',
                            'hover:text-[var(--text-primary)] hover:bg-[var(--bg-active)]',
                            'transition-all'
                        )}
                    >
                        <MoreVertical size={16} />
                    </button>
                )}
            </div>

            {/* Status Badge */}
            {project.status === 'generating' && (
                <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--accent-muted)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                        <span className="text-[var(--text-xs)] text-[var(--accent-primary)]">
                            Generating
                        </span>
                    </div>
                </div>
            )}
        </Link>
    );
}

export default ProjectCard;
