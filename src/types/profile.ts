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
}

export interface Profile {
    id?: number; // Auto-increment (Dexie)
    name: string; // Internal name e.g. "Frontend Dev"
    targetRole: string; // e.g. "Software Engineer"
    intro: string;
    skills: string[]; // Ordered list of strings
    experience: Experience[];
    projects: Project[];
    education: Education[];
    certifications?: Certification[];
    updatedAt: Date;
}
