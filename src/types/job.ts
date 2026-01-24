export const JobStatus = {
    Saved: 'Saved',
    Applied: 'Applied',
    Interview: 'Interview',
    Offer: 'Offer',
    Rejected: 'Rejected',
    Ghosted: 'Ghosted',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export interface Job {
    id?: number; // Auto-increment
    company: string;
    role: string;
    location: string;
    status: JobStatus;
    dateApplied: Date;
    source: string;
    profileId?: number; // FK to Profile
    description?: string; // Full job description
    resumeSnapshot?: string; // The generated resume text
    coverLetterSnapshot?: string; // The generated cover letter text
    keywords?: string[]; // Extracted or manual keywords
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
