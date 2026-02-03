/**
 * ============================================
 * MULTI-AGENT MCP SYSTEM - TYPE DEFINITIONS
 * ============================================
 * All TypeScript interfaces and types for the application
 */

// ==========================================
// PROJECT TYPES
// ==========================================

export interface Project {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'generating' | 'complete' | 'error';
    folderPath?: string;
    thumbnail?: string;
}

export interface ProjectFile {
    id: string;
    projectId: string;
    fileType: 'html' | 'css' | 'js' | 'image' | 'audio' | 'video';
    fileName: string;
    filePath: string;
    content?: string;
    createdAt: string;
}

// ==========================================
// MESSAGE TYPES (Chat)
// ==========================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: string;
    status?: 'sending' | 'sent' | 'error';
}

// ==========================================
// GENERATION TYPES
// ==========================================

export interface GenerationRequest {
    prompt: string;
    projectId?: string;
    options?: GenerationOptions;
}

export interface GenerationOptions {
    generateImages?: boolean;
    generateAudio?: boolean;
    generateVideo?: boolean;
    theme?: 'light' | 'dark' | 'auto';
}

export interface GenerationResult {
    projectId: string;
    files: ProjectFile[];
    html: string;
    css: string;
    js: string;
    status: 'success' | 'partial' | 'error';
    message?: string;
}

// ==========================================
// UI STATE TYPES
// ==========================================

export type ViewMode = 'preview' | 'code';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface UIState {
    sidebarOpen: boolean;
    viewMode: ViewMode;
    deviceMode: DeviceMode;
    isGenerating: boolean;
    currentProjectId: string | null;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ==========================================
// COMPONENT PROP TYPES
// ==========================================

export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: 'sm' | 'md' | 'lg';
    error?: string;
    label?: string;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    label?: string;
}
