
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

export async function* streamOpenRouter(options: OpenRouterOptions): AsyncGenerator<string, void, unknown> {
    const settings = await db.settings.toCollection().first();
    const apiKey = settings?.openRouterApiKey;

    if (!apiKey) {
        throw new Error("OpenRouter API Key is missing. Please configure it in Settings.");
    }

    const body: any = {
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        stream: true
    };

    if (options.response_format) {
        body.response_format = options.response_format;
    }

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://jobos.local',
                'X-Title': 'Personal Job OS',
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            let errorMsg = response.statusText;
            try {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMsg = errorJson.error?.message || errorJson.message || errorText;
                } catch {
                    errorMsg = errorText;
                }
            } catch (e) {
                // ignore
            }
            throw new Error(`AI Request Failed: ${errorMsg}`);
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                // Check specifically for [DONE]
                if (trimmed === "data: [DONE]") continue;
                if (!trimmed.startsWith("data: ")) continue;

                try {
                    const data = JSON.parse(trimmed.slice(6));
                    // OpenRouter/OpenAI standard delta format
                    const content = data.choices?.[0]?.delta?.content;
                    if (content) yield content;
                } catch (e) {
                    console.warn("Stream parse error for line:", trimmed, e);
                }
            }
        }
    } catch (error) {
        console.error("OpenRouter Stream Error:", error);
        throw error;
    }
}
