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
import { generateWebsite, chatModify } from '@/lib/api';

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
    // Only trigger if we have a prompt AND no messages AND no code
    if (initialPrompt && messages.length === 0 && !generatedCode.html) {
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
      let responseHtml = '';
      let responseCss = '';
      let responseJs = '';
      let aiResponseText = '';

      // Determine if this is a new generation or a modification
      // If we have HTML content, it's a modification
      const isModification = !!generatedCode.html;

      if (isModification) {
        // CALL CHAT MODIFY API
        const response = await chatModify(projectId, content, generatedCode);

        responseHtml = response.html;
        responseCss = response.css;
        responseJs = response.javascript;
        aiResponseText = response.assistant_response || "I've updated the website based on your request.";
      } else {
        // CALL GENERATE API
        const response = await generateWebsite(content, projectId);

        responseHtml = response.html;
        responseCss = response.css;
        responseJs = response.javascript;
        aiResponseText = "I've created your website! You can view it in the preview panel.";
      }

      // Update generated code state
      setGeneratedCode({
        html: responseHtml,
        css: responseCss,
        js: responseJs,
      });

      // Add AI message
      const aiMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
      // Add error message
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI backend. Please ensure the backend server is running on port 8000.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  }, [projectId, generatedCode]); // Depend on generatedCode to decide mode

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
