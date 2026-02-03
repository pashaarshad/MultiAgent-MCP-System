/**
 * ============================================
 * API SERVICE
 * ============================================
 * Handles communication with the Python backend
 */

const BACKEND_URL = 'http://localhost:8000/api';

export interface GenerationResponse {
    success: boolean;
    project_id: string;
    html: string;
    css: string;
    javascript: string;
    enhanced_prompt?: string;
    error?: string;
    model_used?: string;
}

export interface ChatResponse {
    success: boolean;
    message: string;
    html: string;
    css: string;
    javascript: string;
    assistant_response: string;
    model_used?: string;
}

/**
 * Generate a new website from a prompt
 */
export async function generateWebsite(prompt: string, projectId?: string): Promise<GenerationResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                project_id: projectId,
                enhance_prompt: true,
                include_images: false,
                single_file: false // We want separate blocks
            }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Generation failed:', error);
        throw error;
    }
}

/**
 * Modify existing website via chat
 */
export async function chatModify(
    projectId: string,
    message: string,
    currentCode: { html: string; css: string; js: string }
): Promise<ChatResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                project_id: projectId,
                message,
                current_html: currentCode.html,
                current_css: currentCode.css,
                current_js: currentCode.js,
            }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Chat modification failed:', error);
        throw error;
    }
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
}
