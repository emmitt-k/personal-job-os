export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
    id?: number; // Singleton ID, usually 1
    openRouterApiKey?: string;
    theme: Theme;
    updatedAt: Date;
}

export const DEFAULT_SETTINGS: Omit<AppSettings, 'id' | 'updatedAt'> = {
    theme: 'system',
};
