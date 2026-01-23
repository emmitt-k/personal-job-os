import { db } from '@/db/client';

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OpenRouterOptions {
    model: string;
    messages: OpenRouterMessage[];
    temperature?: number;
    response_format?: { type: 'json_object' };
}

export async function callOpenRouter(options: OpenRouterOptions): Promise<string> {
    const settings = await db.settings.toCollection().first();
    const apiKey = settings?.openRouterApiKey;

    if (!apiKey) {
        throw new Error("OpenRouter API Key is missing. Please configure it in Settings.");
    }

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://jobos.local',
                'X-Title': 'Personal Job OS',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: options.model,
                messages: options.messages,
                temperature: options.temperature ?? 0.7,
                response_format: options.response_format
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`AI Request Failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";

    } catch (error) {
        console.error("OpenRouter API Error:", error);
        throw error;
    }
}
