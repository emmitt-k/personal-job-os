import { callOpenRouter } from './client';

const MODEL = 'openai/gpt-4o-mini';

export interface ATSAnalysis {
    score: number;
    feedback: string;
    missingKeywords: string[];
}

export async function extractKeywords(jobDescription: string): Promise<string[]> {
    const systemPrompt = `
    You are an expert ATS optimizer. Extract the most critical hard skills, technologies, and keywords from the following Job Description as individual items.
    
    Return ONLY a JSON array of strings, where each string is a single keyword or skill.
    Avoid grouping keywords together. Do NOT include category names.

    Example Output:
    [
        "Node.js",
        "Python",
        "PHP",
        "AWS",
        "React.js",
        "TypeScript",
        "Docker",
        "Kubernetes"
    ]

    Ensure you cover all major technical areas mentioned in the JD.
    `;

    try {
        const content = await callOpenRouter({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: jobDescription }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        });

        if (!content) return [];

        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
        if (parsed.keywords && Array.isArray(parsed.keywords)) return parsed.keywords;
        if (parsed.skills && Array.isArray(parsed.skills)) return parsed.skills;

        return [];
    } catch (error) {
        console.error("Keyword Extraction Error:", error);
        return [];
    }
}

export async function calculateATSScore(resumeText: string, jobDescription: string): Promise<ATSAnalysis> {
    const systemPrompt = `
    You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of recruitment algorithms.
    
    Your Task:
    Perform a comprehensive analysis of the Resume against the Job Description and calculate a precise ATS Match Score (0-100).
    
    Return the result as a valid JSON object matching this TypeScript interface:
    
    interface ATSAnalysis {
        score: number; // Integer between 0 and 100
        feedback: string; // A concise summary (max 2 sentences) explaining the score.
        missingKeywords: string[]; // Up to 5 critical keywords from the JD missing in the resume.
    }
    
    DETAILED SCORING CRITERIA:
    
    1. HARD SKILLS & KEYWORD MATCHING (45 points):
       - Exact matches for required technologies, tools, frameworks (20 pts)
       - Skill variations and synonyms (e.g., "JS" vs "JavaScript") (10 pts)
       - Certifications and qualifications mentioned in JD (10 pts)
       - Industry-specific terminology and jargon (5 pts)
    
    2. EXPERIENCE ALIGNMENT (25 points):
       - Years of experience match (10 pts)
       - Relevant job titles and roles (8 pts)
       - Domain/industry experience (7 pts)
    
    3. CONTEXTUAL RELEVANCE (15 points):
       - Project descriptions align with job requirements (8 pts)
       - Quantifiable achievements related to JD needs (7 pts)
    
    4. SOFT SKILLS & COMPETENCIES (10 points):
       - Leadership, teamwork, communication skills mentioned in JD (5 pts)
       - Problem-solving and analytical abilities (5 pts)
    
    5. RESUME QUALITY (5 points):
       - Clear structure and readability (3 pts)
       - Professional formatting (2 pts)
    
    SCORING GUIDELINES:
    - 90-100: Exceptional match, candidate exceeds requirements
    - 75-89: Strong match, candidate meets most/all requirements
    - 60-74: Good match, candidate meets core requirements with some gaps
    - 40-59: Moderate match, significant gaps in key areas
    - 0-39: Poor match, major misalignment
    
    MISSING KEYWORDS IDENTIFICATION:
    - Prioritize HARD SKILLS and TECHNOLOGIES that are explicitly required in the JD
    - Focus on must-have requirements, not nice-to-haves
    - Use exact terminology from the JD (e.g., "React.js" not "React")
    - Limit to 5 most critical gaps that would impact hiring decision
    
    Be strict and realistic in your scoring. A perfect 100 should be rare and only for candidates who clearly exceed all requirements.
    `;

    try {
        let content = await callOpenRouter({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME CONTENT:\n${resumeText}\n\nReturn the analysis in JSON format.` }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        });

        // Sanitize
        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1) {
            content = content.substring(startIndex, endIndex + 1);
        }

        const parsed = JSON.parse(content);
        return {
            score: Number(parsed.score) || 0,
            feedback: parsed.feedback || "No feedback provided.",
            missingKeywords: parsed.missingKeywords || []
        } as ATSAnalysis;

    } catch (error: any) {
        console.error("ATS Analysis Error:", error);
        return { score: 0, feedback: `Analysis failed: ${error.message || 'Unknown error'}`, missingKeywords: [] };
    }
}
