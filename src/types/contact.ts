export interface Contact {
    id?: number;
    name: string;
    role: string;
    company: string;
    email?: string;
    linkedin?: string;
    status: 'contacted' | 'replied' | 'interviewing' | 'ghosted' | 'rejected' | 'offer';
    relationshipStrength: 'weak' | 'moderate' | 'strong';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
