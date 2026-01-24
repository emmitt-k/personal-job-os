import { callOpenRouter } from './client';
import { type Profile } from '@/types/profile';
import { v4 as uuidv4 } from 'uuid';

const MODEL = 'openai/gpt-4o-mini';

export async function parseResumeWithAI(resumeText: string): Promise<Profile> {
    const systemPrompt = `
    You are an expert resume parser. Your job is to extract structured data from a raw resume text and return it as a JSON object.
    
    Return ONLY valid JSON. No markdown formatting, no code blocks.
    
    The structure must strictly follow this TypeScript interface (excluding IDs, which I will generate):
    
    interface ParsedProfile {
        name: string;
        targetRole: string;
        intro: string;
        skills: string[];
        contactInfo: {
            email: string;
            phone: string;
            location: string;
            linkedin: string;
            github: string;
            website: string;
        };
        hrData: {
            noticePeriod: string; // e.g. "Immediate", "2 weeks", "3 months"
            workPreference: string; // e.g. "Remote", "Hybrid", "On-site" (Infer if possible)
        };
        experience: Array<{
            company: string;
            role: string;
            startDate: string;
            endDate: string;
            current: boolean;
            description: string;
        }>;
        projects: Array<{
            name: string;
            description: string;
            url?: string;
        }>;
        education: Array<{
            institution: string;
            degree: string;
            startDate: string;
            endDate: string;
        }>;
        certifications: Array<{
            name: string;
            issuer: string;
            year: string;
        }>;
    }
    
    If any field is missing, use empty strings or empty arrays. Do not invent data.
    `;

    try {
        const content = await callOpenRouter({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: resumeText }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        });

        if (!content) {
            throw new Error("No content received from AI.");
        }

        const parsed: any = JSON.parse(content);

        // Transform into full Profile object
        const profile: Profile = {
            id: undefined,
            name: parsed.name || 'Unknown Candidate',
            targetRole: parsed.targetRole || 'Job Seeker',
            intro: parsed.intro || '',
            skills: Array.isArray(parsed.skills) ? parsed.skills : [],
            contactInfo: {
                email: parsed.contactInfo?.email || '',
                phone: parsed.contactInfo?.phone || '',
                location: parsed.contactInfo?.location || '',
                linkedin: parsed.contactInfo?.linkedin || '',
                github: parsed.contactInfo?.github || '',
                website: parsed.contactInfo?.website || '',
            },
            hrData: {
                noticePeriod: parsed.hrData?.noticePeriod || '',
                workPreference: parsed.hrData?.workPreference || '',
            },
            experience: Array.isArray(parsed.experience) ? parsed.experience.map((e: any) => ({
                id: uuidv4(),
                company: e.company || 'Unknown',
                role: e.role || 'Unknown',
                startDate: e.startDate || '',
                endDate: e.endDate || '',
                current: !!e.current,
                description: e.description || ''
            })) : [],
            projects: Array.isArray(parsed.projects) ? parsed.projects.map((p: any) => ({
                id: uuidv4(),
                name: p.name || 'Unnamed Project',
                description: p.description || '',
                url: p.url || ''
            })) : [],
            education: Array.isArray(parsed.education) ? parsed.education.map((e: any) => ({
                id: uuidv4(),
                institution: e.institution || '',
                degree: e.degree || '',
                startDate: e.startDate || '',
                endDate: e.endDate || ''
            })) : [],
            certifications: Array.isArray(parsed.certifications) ? parsed.certifications.map((c: any) => ({
                id: uuidv4(),
                name: c.name || '',
                issuer: c.issuer || '',
                year: c.year || '',
                url: ''
            })) : [],
            updatedAt: new Date(),
        };

        return profile;

    } catch (error) {
        console.error("AI Parse Error:", error);
        throw error;
    }
}

export async function generateResumeDraft(profile: Profile, jobDetails: { company: string; role: string; description: string }, keywords: string[] = []): Promise<string> {
    const systemPrompt = `
    You are an expert resume writer. Your goal is to tailor a candidate's profile to a specific job description using a STRICT, LOCKED-IN FORMAT.

    You will be given:
    1. The Candidate's Profile (JSON)
    2. The Job Details (Company, Role, Description)
    
    Output:
    A complete, plain-text resume formatted in Markdown.
    
    **CRITICAL FORMATTING RULES (DO NOT DEVIATE):**

    1. **NO HEADER**: Start immediately with "## PROFESSIONAL SUMMARY". Do NOT output Name, Phone, Email, Links.
       - **CONSTRAINT**: The Professional Summary MUST NOT exceed 400 characters.
    2. **SECTION HEADERS**: Use H2 (##) and UPPERCASE for:
       - ## PROFESSIONAL SUMMARY
       - ## SKILLS
       - ## EXPERIENCE
       - ## PROJECTS
       - ## EDUCATION
    
    3. **SKILLS FORMAT**:
       **Category Name**: Skill 1, Skill 2, Skill 3
    
    4. **EXPERIENCE FORMAT** (Strictly follow this structure):
       ### Role Title | Start Date - End Date
       **Company Name**
       *   Bullet point starts here...
       *   Another bullet point...
       *   (Must have at least 3 bullets per role)
       
       *Note: If multiple roles at same company, repeat the Company Name line or structure clearly.*
    
    5. **PROJECTS FORMAT** (Strictly follow this structure):
       ### Project Name
       *   Bullet point describing the project, tech stack, or achievement...
       *   Another bullet point...

    6. **EDUCATION FORMAT**:
       ### Degree Name | Start Date - End Date
       **Institution Name**
    
    7. **CONTENT RULES**:
       - **NO FLUFF**: Do not add "Additional Information", "References", or conversational outros like "Hope this helps".
       - **NO CODE BLOCKS**: Return raw markdown text.
       - **Tone**: Professional, action-oriented, quantifiable results.
    `;

    const userPrompt = `
    PROFILE:
    ${JSON.stringify(profile, null, 2)}
    
    JOB DETAILS:
    Company: ${jobDetails.company}
    Role: ${jobDetails.role}
    Description:
    ${jobDetails.description}

    MANDATORY KEYWORDS TO INTEGRATE:
    ${keywords.length > 0 ? keywords.join(', ') : 'None specified. Extract relevant keywords from the description.'}
    `;

    try {
        let content = await callOpenRouter({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7
        });

        // Cleanup
        content = content.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

        const firstHeaderMatch = content.match(/^(#+\s*(Professional Summary|Summary|Skills|Experience))/im);
        if (firstHeaderMatch && firstHeaderMatch.index && firstHeaderMatch.index > 0) {
            content = content.substring(firstHeaderMatch.index);
        }

        const fluffPatterns = [
            /This resume aligns (closely|well) with/i,
            /This resume has been (tailored|optimized) for/i,
            /I have highlighted (the|your)/i,
            /The above resume/i,
            /Please let me know if/i
        ];
        const lines = content.split('\n');
        for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
            if (fluffPatterns.some(p => p.test(lines[i]))) {
                content = lines.slice(0, i).join('\n').trim();
                break;
            }
        }

        return content;
    } catch (error) {
        console.error("AI Gen Error:", error);
        throw error;
    }
}

export async function refineResume(currentResume: string, instructions: string): Promise<string> {
    const systemPrompt = `
    You are an expert resume editor. You will refine an existing resume draft based on specific user instructions while maintaining a STRICT LOCKED-IN FORMAT.
    
    **CRITICAL FORMATTING RULES (DO NOT DEVIATE):**
    
    1. **NO HEADER**: Start immediately with the first section (e.g., ## PROFESSIONAL SUMMARY). Do NOT add Name/Contact headers.
    2. **HEADINGS**: Use H2 (##) and UPPERCASE for all main sections.
    3. **EXPERIENCE FORMAT**:
       ### Role Title | Start Date - End Date
       **Company Name**
       *   Bullet point...
    4. **PROJECTS FORMAT**:
       ### Project Name
       *   Bullet point...
    5. **EDUCATION FORMAT**:
       ### Degree Name | Start Date - End Date
       **Institution Name**
    
    6. **NO FLUFF**: Do not add conversational text, "Here is the updated resume", or code blocks. Just the raw markdown.
    
    **INSTRUCTIONS**: verify the user instructions below and apply them to the resume content.
    `;

    const userPrompt = `
    CURRENT RESUME:
    ${currentResume}
    
    INSTRUCTIONS:
    ${instructions}
    `;

    try {
        let content = await callOpenRouter({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.5
        });

        content = content.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

        const firstHeaderMatch = content.match(/^(#+\s*(Professional Summary|Summary|Skills|Experience))/im);
        if (firstHeaderMatch && firstHeaderMatch.index && firstHeaderMatch.index > 0) {
            content = content.substring(firstHeaderMatch.index);
        }

        return content;
    } catch (error) {
        console.error("AI Refine Error:", error);
        throw error;
    }
}
