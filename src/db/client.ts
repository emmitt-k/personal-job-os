import Dexie, { type EntityTable } from 'dexie';
import { type Job } from '../types/job';
import { type Profile } from '../types/profile';

import { type AppSettings } from '../types/settings';
import { type Contact } from '../types/contact';

const DB_NAME = 'JobOS_DB_v1';

export const db = new Dexie(DB_NAME) as Dexie & {
    jobs: EntityTable<Job, 'id'>;
    profiles: EntityTable<Profile, 'id'>;
    settings: EntityTable<AppSettings, 'id'>;
    jobDrafts: EntityTable<{ id?: number; formData: Job; updatedAt: Date }, 'id'>;
    contacts: EntityTable<Contact, 'id'>;
};

// Schema definition
db.version(1).stores({
    jobs: '++id, company, status, dateApplied, profileId, createdAt',
    profiles: '++id, name, updatedAt',
    settings: '++id',
    jobDrafts: '++id, updatedAt'
});

db.version(2).stores({
    contacts: '++id, name, company, status, relationshipStrength, createdAt'
});

export type JobOSDB = typeof db;
