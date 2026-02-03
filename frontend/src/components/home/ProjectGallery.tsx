'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/types';

/**
 * ============================================
 * PROJECT GALLERY COMPONENT
 * ============================================
 * Grid display of projects with tab filtering
 * 
 * CUSTOMIZATION:
 * - Modify grid columns
 * - Add/remove tabs
 * - Change empty state
 */

interface ProjectGalleryProps {
    projects: Project[];
    onProjectOptionsClick?: (projectId: string) => void;
}

type TabType = 'recent' | 'my-projects' | 'templates';

const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'recent', label: 'Recently viewed' },
    { id: 'my-projects', label: 'My projects' },
    { id: 'templates', label: 'Templates' },
];

export function ProjectGallery({
    projects,
    onProjectOptionsClick
}: ProjectGalleryProps) {
    const [activeTab, setActiveTab] = useState<TabType>('recent');

    // Filter projects based on active tab (placeholder logic)
    const filteredProjects = projects.filter(() => {
        // For now, show all projects in all tabs
        // In real app, filter based on tab type
        return true;
    });

    return (
        <div className="w-full">
            {/* Tabs and Browse All */}
            <div className="flex items-center justify-between mb-6">
                {/* Tab Buttons */}
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'px-4 py-2 rounded-[var(--radius-md)]',
                                'text-[var(--text-sm)] font-medium',
                                'transition-colors duration-[var(--transition-fast)]',

                                activeTab === tab.id
                                    ? 'text-[var(--text-primary)] bg-[var(--bg-tertiary)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Browse All Link */}
                <button
                    className={cn(
                        'text-[var(--text-sm)] text-[var(--text-muted)]',
                        'hover:text-[var(--text-primary)]',
                        'transition-colors'
                    )}
                >
                    Browse all →
                </button>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onOptionsClick={onProjectOptionsClick}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                        <span className="text-2xl">📁</span>
                    </div>
                    <h3 className="text-[var(--text-lg)] font-medium text-[var(--text-primary)] mb-2">
                        No projects yet
                    </h3>
                    <p className="text-[var(--text-sm)] text-[var(--text-muted)] max-w-sm">
                        Start by describing a website or UI in the prompt above.
                        Your projects will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}

export default ProjectGallery;
