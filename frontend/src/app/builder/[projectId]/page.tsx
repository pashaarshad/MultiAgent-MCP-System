'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ChatPanel } from '@/components/builder/ChatPanel';
import { PreviewPanel } from '@/components/builder/PreviewPanel';
import { CodePanel } from '@/components/builder/CodePanel';
import type { Message, ViewMode, DeviceMode } from '@/types';

/**
 * ============================================
 * BUILDER PAGE
 * ============================================
 * Main editor page with chat panel and preview/code panels
 * 
 * CUSTOMIZATION:
 * - Modify panel widths
 * - Change layout arrangement
 * - Add more features
 */

// Mock AI response generator (placeholder for MCP integration)
const generateMockResponse = async (prompt: string): Promise<{ html: string; css: string; js: string; message: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate sample code based on prompt keywords
    const isLanding = prompt.toLowerCase().includes('landing');
    const isPortfolio = prompt.toLowerCase().includes('portfolio');
    const hasDark = prompt.toLowerCase().includes('dark');

    const html = `
<div class="min-h-screen ${hasDark ? 'bg-gray-900' : 'bg-white'}">
  <!-- Header -->
  <header class="px-6 py-4 ${hasDark ? 'bg-gray-800' : 'bg-gray-50'}">
    <nav class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="text-2xl font-bold ${hasDark ? 'text-white' : 'text-gray-900'}">
        ${isPortfolio ? 'My Portfolio' : 'Brand'}
      </div>
      <div class="flex gap-6">
        <a href="#" class="${hasDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}">Home</a>
        <a href="#" class="${hasDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}">About</a>
        <a href="#" class="${hasDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}">Contact</a>
      </div>
    </nav>
  </header>

  <!-- Hero Section -->
  <section class="px-6 py-20">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-5xl font-bold mb-6 ${hasDark ? 'text-white' : 'text-gray-900'}">
        ${isLanding ? 'Welcome to Our Amazing Product' : isPortfolio ? 'Hi, I\'m a Developer' : 'Beautiful Website'}
      </h1>
      <p class="text-xl mb-8 ${hasDark ? 'text-gray-300' : 'text-gray-600'}">
        ${isLanding ? 'Build something amazing with our cutting-edge solution.' : isPortfolio ? 'I create stunning digital experiences.' : 'Crafted with care and attention to detail.'}
      </p>
      <div class="flex gap-4 justify-center">
        <button class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          Get Started
        </button>
        <button class="px-6 py-3 border ${hasDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-lg hover:bg-gray-100 transition-colors">
          Learn More
        </button>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="px-6 py-16 ${hasDark ? 'bg-gray-800' : 'bg-gray-50'}">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12 ${hasDark ? 'text-white' : 'text-gray-900'}">
        Features
      </h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="p-6 ${hasDark ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-lg">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span class="text-2xl">⚡</span>
          </div>
          <h3 class="text-xl font-semibold mb-2 ${hasDark ? 'text-white' : 'text-gray-900'}">Fast</h3>
          <p class="${hasDark ? 'text-gray-300' : 'text-gray-600'}">Lightning fast performance for the best user experience.</p>
        </div>
        <div class="p-6 ${hasDark ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-lg">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span class="text-2xl">🔒</span>
          </div>
          <h3 class="text-xl font-semibold mb-2 ${hasDark ? 'text-white' : 'text-gray-900'}">Secure</h3>
          <p class="${hasDark ? 'text-gray-300' : 'text-gray-600'}">Enterprise-grade security to protect your data.</p>
        </div>
        <div class="p-6 ${hasDark ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-lg">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span class="text-2xl">✨</span>
          </div>
          <h3 class="text-xl font-semibold mb-2 ${hasDark ? 'text-white' : 'text-gray-900'}">Beautiful</h3>
          <p class="${hasDark ? 'text-gray-300' : 'text-gray-600'}">Stunning design that makes an impression.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="px-6 py-8 ${hasDark ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-50 border-t border-gray-200'}">
    <div class="max-w-6xl mx-auto text-center ${hasDark ? 'text-gray-400' : 'text-gray-600'}">
      <p>&copy; 2024 Brand. All rights reserved.</p>
    </div>
  </footer>
</div>
  `.trim();

    const css = `
/* Custom styles */
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Smooth transitions */
a, button {
  transition: all 0.2s ease;
}

/* Custom hover effects */
.shadow-lg:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
  `.trim();

    const js = `
// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href'))?.scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Add animation on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in');
    }
  });
});

document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});
  `.trim();

    return {
        html,
        css,
        js,
        message: `I've created a ${isLanding ? 'landing page' : isPortfolio ? 'portfolio website' : 'beautiful website'} with a ${hasDark ? 'dark' : 'light'} theme. It includes a header with navigation, a hero section with call-to-action buttons, a features grid, and a footer. You can ask me to modify any part of it!`
    };
};

export default function BuilderPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const projectId = params.projectId as string;
    const initialPrompt = searchParams.get('prompt');

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('preview');
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
    const [isGenerating, setIsGenerating] = useState(false);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);

    // Generated Code State
    const [generatedCode, setGeneratedCode] = useState({
        html: '',
        css: '',
        js: '',
    });

    // Handle initial prompt from URL
    useEffect(() => {
        if (initialPrompt && messages.length === 0) {
            handleSendMessage(initialPrompt);
        }
    }, [initialPrompt]);

    // Generate unique message ID
    const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Handle sending a message
    const handleSendMessage = useCallback(async (content: string) => {
        // Add user message
        const userMessage: Message = {
            id: generateMessageId(),
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsGenerating(true);

        try {
            // Generate AI response (mock for now)
            const response = await generateMockResponse(content);

            // Update generated code
            setGeneratedCode({
                html: response.html,
                css: response.css,
                js: response.js,
            });

            // Add AI message
            const aiMessage: Message = {
                id: generateMessageId(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            // Add error message
            const errorMessage: Message = {
                id: generateMessageId(),
                role: 'assistant',
                content: 'Sorry, I encountered an error while generating your website. Please try again.',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    // Handle reload
    const handleReload = () => {
        // Force iframe refresh by resetting and re-setting code
        const currentCode = { ...generatedCode };
        setGeneratedCode({ html: '', css: '', js: '' });
        setTimeout(() => setGeneratedCode(currentCode), 100);
    };

    // Handle export/download
    const handleExport = () => {
        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
${generatedCode.css}
  </style>
</head>
<body>
${generatedCode.html}
  <script>
${generatedCode.js}
  </script>
</body>
</html>
    `.trim();

        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'website.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                recentProjects={[]}
            />

            {/* Header */}
            <Header
                sidebarOpen={sidebarOpen}
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                deviceMode={deviceMode}
                onDeviceModeChange={setDeviceMode}
                isGenerating={isGenerating}
                onReload={handleReload}
                onExport={handleExport}
                showViewControls={true}
            />

            {/* Main Content */}
            <div
                className={cn(
                    'pt-[var(--header-height)]',
                    'h-screen',
                    'transition-all duration-[var(--transition-normal)]',

                    // Adjust for sidebar
                    sidebarOpen
                        ? 'ml-[var(--sidebar-width)]'
                        : 'ml-0 lg:ml-[var(--sidebar-collapsed-width)]'
                )}
            >
                <div className="flex h-[calc(100vh-var(--header-height))]">
                    {/* Chat Panel */}
                    <div className={cn(
                        'w-[var(--chat-panel-width)] flex-shrink-0',
                        'border-r border-[var(--border-primary)]',
                        'hidden md:block'
                    )}>
                        <ChatPanel
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isLoading={isGenerating}
                        />
                    </div>

                    {/* Preview / Code Panel */}
                    <div className="flex-1 overflow-hidden">
                        {viewMode === 'preview' ? (
                            <PreviewPanel
                                html={generatedCode.html}
                                css={generatedCode.css}
                                js={generatedCode.js}
                                deviceMode={deviceMode}
                                onReload={handleReload}
                            />
                        ) : (
                            <CodePanel
                                html={generatedCode.html}
                                css={generatedCode.css}
                                js={generatedCode.js}
                                onDownload={handleExport}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Chat Panel (Bottom Sheet) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
                <div className="h-[50vh] bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]">
                    <ChatPanel
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isGenerating}
                    />
                </div>
            </div>
        </div>
    );
}
