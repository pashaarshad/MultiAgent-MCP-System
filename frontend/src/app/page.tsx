'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { generateProjectId } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { PromptInput } from '@/components/home/PromptInput';
import { ProjectGallery } from '@/components/home/ProjectGallery';
import { Sparkles } from 'lucide-react';
import type { Project } from '@/types';

/**
 * ============================================
 * HOME PAGE
 * ============================================
 * Landing page with prompt input and project gallery
 * 
 * CUSTOMIZATION:
 * - Modify welcome message
 * - Add more sections
 * - Change layout
 */

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: 'project_001',
    name: 'E-commerce Landing Page',
    createdAt: "2024-03-10T10:30:00.000Z",
    updatedAt: "2024-03-10T14:30:00.000Z",
    status: 'complete',
  },
  {
    id: 'project_002',
    name: 'Portfolio Website',
    createdAt: "2024-03-09T09:00:00.000Z",
    updatedAt: "2024-03-09T16:45:00.000Z",
    status: 'complete',
  },
  {
    id: 'project_003',
    name: 'Blog Template',
    createdAt: "2024-03-01T08:00:00.000Z",
    updatedAt: "2024-03-01T08:00:00.000Z",
    status: 'generating',
  },
];

// Sidebar recent projects
const recentProjects = [
  { id: 'project_001', name: 'E-commerce Landing' },
  { id: 'project_002', name: 'Portfolio Website' },
  { id: 'project_003', name: 'Blog Template' },
];

export default function HomePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePromptSubmit = async (prompt: string) => {
    setIsGenerating(true);

    // Generate a new project ID
    const projectId = generateProjectId();

    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Navigate to the builder page
    router.push(`/builder/${projectId}?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleProjectOptionsClick = (projectId: string) => {
    console.log('Options clicked for project:', projectId);
    // TODO: Open options menu (rename, delete, duplicate)
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        recentProjects={recentProjects}
        userName="Developer"
      />

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen',
          'transition-all duration-[var(--transition-normal)]',
          'px-6 py-8',

          // Adjust for sidebar
          sidebarOpen
            ? 'ml-[var(--sidebar-width)]'
            : 'ml-0 lg:ml-[var(--sidebar-collapsed-width)]'
        )}
      >
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12 pt-8 animate-fadeIn">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-muted)] mb-6">
              <Sparkles size={32} className="text-[var(--accent-primary)]" />
            </div>

            {/* Greeting */}
            <h1 className="text-[var(--text-3xl)] font-bold text-[var(--text-primary)] mb-3">
              Ready to build, <span className="text-gradient">Developer</span>?
            </h1>

            <p className="text-[var(--text-base)] text-[var(--text-secondary)] max-w-lg mx-auto">
              Describe your website or UI, and let our AI agents bring it to life.
              Just type what you want to create.
            </p>
          </div>

          {/* Prompt Input */}
          <div className="mb-16 animate-slideUp" style={{ animationDelay: '100ms' }}>
            <PromptInput
              onSubmit={handlePromptSubmit}
              isLoading={isGenerating}
              placeholder="Create a modern landing page with a hero section, features grid, and testimonials..."
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 animate-slideUp" style={{ animationDelay: '200ms' }}>
            {[
              'Landing page',
              'Portfolio',
              'Dashboard',
              'Blog',
              'E-commerce',
              'SaaS'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handlePromptSubmit(`Create a ${suggestion.toLowerCase()} website`)}
                className={cn(
                  'px-4 py-2 rounded-[var(--radius-full)]',
                  'bg-[var(--bg-secondary)] border border-[var(--border-primary)]',
                  'text-[var(--text-sm)] text-[var(--text-secondary)]',
                  'hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)]',
                  'hover:bg-[var(--bg-hover)]',
                  'transition-colors'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Project Gallery */}
          <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
            <ProjectGallery
              projects={mockProjects}
              onProjectOptionsClick={handleProjectOptionsClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
