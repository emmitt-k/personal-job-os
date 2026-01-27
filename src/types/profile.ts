export interface Experience {
    id: string; // UUID
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface Project {
    id: string; // UUID
    name: string;
    description: string;
    url?: string;
}

export interface Education {
    id: string; // UUID
    degree: string;
    institution: string;
    startDate: string; // Year or full date
    endDate: string;
}

export interface Certification {
    id: string; // UUID
    name: string;
    issuer: string;
    year: string;
    url?: string;
}

export interface Profile {
    id?: number; // Auto-increment (Dexie)
    name: string; // Internal name e.g. "Frontend Dev"
    targetRole: string; // e.g. "Software Engineer"
    intro: string;
    skills: string[]; // Ordered list of strings

    // Contact Info
    contactInfo: {
        email?: string;
        phone?: string;
        location?: string;
        linkedin?: string;
        github?: string;
        website?: string;
    };

    // HR Data
    hrData: {
        workPreference?: 'Remote' | 'On-Site' | 'Hybrid';
        noticePeriod?: string;
    };

    experience: Experience[];
    projects: Project[];
    education: Education[];
    certifications: Certification[];
    updatedAt: Date;
    photo?: string; // Base64 or URL
}
