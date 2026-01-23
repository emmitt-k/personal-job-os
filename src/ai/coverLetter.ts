import { type Profile } from '@/types/profile';
import { callOpenRouter } from '@/ai/client';

const MODEL = 'openai/gpt-4o-mini';

export async function generateCoverLetter(profile: Profile, jobDetails: { company: string; role: string; description: string }): Promise<string> {
    const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const systemPrompt = `
    You are an expert career coach and professional writer. Your goal is to write a compelling, tailored cover letter for a job application.
    
    Format Guidelines:
    - **Date**: Use "${formattedDate}" at the top.
    - **Structure**: Standard business letter.
    - **Text Style**: logical paragraphs. DO NOT indent the first line of paragraphs. DO NOT use code blocks.
    - **Length**: STRICTLY keep the total length under 300 words. It MUST fit on a single A4 page with margins.
    - **Formatting**: Use single spacing. 
    - **Signature**:
        Sincerely,
        ${profile.name}
        ${profile.contactInfo?.email || ''}
        ${profile.contactInfo?.phone || ''}
        ${profile.contactInfo?.linkedin || ''}
        (DO NOT include Location/Address)
    
    Content Structure:
    1. **Date**: "${formattedDate}"
    2. **Salutation**: Dear Hiring Manager,
    3. **Opening**: Hook the reader, mention role/company (2-3 sentences max).
    4. **Body**: 1-2 concise paragraphs focusing ONLY on the most relevant experience. Match the JD. Avoid fluff.
    5. **Closing**: Reiterate interest and call to action (1-2 sentences).
    6. **Sign-off**: Sincerely, Name + Contact.
    `;

    const userPrompt = `
    CANDIDATE PROFILE:
    ${JSON.stringify(profile, null, 2)}
    
    JOB DETAILS:
    Company: ${jobDetails.company}
    Role: ${jobDetails.role}
    Description:
    ${jobDetails.description}
    `;

    try {
        const content = await callOpenRouter({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7
        });

        return content || "Failed to generate cover letter.";

    } catch (error) {
        console.error("Cover Letter Gen Error:", error);
        throw error;
    }
}
