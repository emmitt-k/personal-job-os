import Dexie, { type EntityTable } from 'dexie';
import { type Job } from '../types/job';
import { type Profile } from '../types/profile';

import { type AppSettings } from '../types/settings';

const DB_NAME = 'JobOS_DB_v1';

export const db = new Dexie(DB_NAME) as Dexie & {
    jobs: EntityTable<Job, 'id'>;
    profiles: EntityTable<Profile, 'id'>;
    settings: EntityTable<AppSettings, 'id'>;
};

// Schema definition
db.version(1).stores({
    jobs: '++id, company, status, dateApplied, profileId, createdAt',
    profiles: '++id, name, updatedAt',
    settings: '++id' // Singleton table, primarily accessed by ID=1 or .toArray()[0]
});

export type JobOSDB = typeof db;
