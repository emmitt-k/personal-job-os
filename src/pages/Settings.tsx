import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/client';
import { type AppSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { Key, Moon, Sun, Monitor, Trash2, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Settings() {
    const settings = useLiveQuery(() => db.settings.toCollection().first());

    useEffect(() => {
        const initSettings = async () => {
            const count = await db.settings.count();
            if (count === 0) {
                await db.settings.add({ ...DEFAULT_SETTINGS, updatedAt: new Date() });
            }
        };
        initSettings();
    }, []);

    const [apiKeyInput, setApiKeyInput] = useState<string>('');
    const [isEditingKey, setIsEditingKey] = useState(false);

    // Update settings helper
    const updateSettings = async (updates: Partial<AppSettings>) => {
        if (!settings?.id) return;
        await db.settings.update(settings.id, {
            ...updates,
            updatedAt: new Date()
        });
    };

    // Export Data
    const handleExport = async () => {
        try {
            const allData = {
                jobs: await db.jobs.toArray(),
                profiles: await db.profiles.toArray(),
                settings: await db.settings.toArray(),
                exportedAt: new Date().toISOString(),
                version: '1.0.0'
            };

            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `job-os-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data.');
        }
    };

    // Delete Data
    const handleDeleteData = async () => {
        if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
            try {
                await db.transaction('rw', db.jobs, db.profiles, db.settings, async () => {
                    await db.jobs.clear();
                    await db.profiles.clear();
                    // Reset settings to default instead of clearing
                    await db.settings.clear();
                    await db.settings.add({ ...DEFAULT_SETTINGS, updatedAt: new Date() });
                });
                alert('All data has been cleared.');
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Failed to delete data.');
            }
        }
    };

    if (!settings) return null;

    return (
        <div className="h-full overflow-auto bg-muted/30 p-6">
            <div className="max-w-2xl space-y-8 mx-auto">
                <header className="mb-8">
                    <h1 className="text-xl font-semibold text-foreground">Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your local data and configuration.</p>
                </header>

                {/* AI Configuration */}
                <section className="bg-card rounded-lg border border-border shadow-sm p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md text-purple-700 dark:text-purple-300">
                            <Key size={20} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">AI Configuration</h2>
                                <p className="text-sm text-muted-foreground mt-1">Configure OpenRouter to power resume generation.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">OpenRouter API Key</label>
                                <div className="flex gap-2">
                                    {isEditingKey ? (
                                        <>
                                            <input
                                                type="text"
                                                value={apiKeyInput}
                                                onChange={(e) => setApiKeyInput(e.target.value)}
                                                placeholder="sk-or-v1-..."
                                                className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring font-mono text-foreground"
                                            />
                                            <button
                                                onClick={() => {
                                                    updateSettings({ openRouterApiKey: apiKeyInput });
                                                    setIsEditingKey(false);
                                                }}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditingKey(false)}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <input
                                                type="password"
                                                value={settings.openRouterApiKey || ''}
                                                readOnly
                                                className="flex-1 h-9 rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm font-mono text-muted-foreground focus:outline-none cursor-not-allowed"
                                            />
                                            <button
                                                onClick={() => {
                                                    setApiKeyInput(settings.openRouterApiKey || '');
                                                    setIsEditingKey(true);
                                                }}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">Your key is stored locally in your browser and never sent to our servers.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section className="bg-card rounded-lg border border-border shadow-sm p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-accent rounded-md text-foreground">
                            <Monitor size={20} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">Appearance</h2>
                                <p className="text-sm text-muted-foreground mt-1">Customize how Job OS looks on your device.</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground">Theme</label>
                                <div className="flex items-center p-1 bg-muted rounded-lg">
                                    {[
                                        { value: 'light', icon: Sun, label: 'Light' },
                                        { value: 'dark', icon: Moon, label: 'Dark' },
                                        { value: 'system', icon: Monitor, label: 'System' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => updateSettings({ theme: option.value as AppSettings['theme'] })}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm flex items-center gap-1.5 transition-all ${settings.theme === option.value
                                                ? 'bg-background text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <option.icon size={12} />
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Management */}
                <section className="bg-card rounded-lg border border-border shadow-sm p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
                            <Download size={20} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">Data Management</h2>
                                <p className="text-sm text-muted-foreground mt-1">Export your data for backup or portability.</p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Export All Data</p>
                                    <p className="text-xs text-muted-foreground">Download a JSON file containing all jobs and profiles.</p>
                                </div>
                                <button
                                    onClick={handleExport}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2"
                                >
                                    <Download size={14} />
                                    Export JSON
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-card rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-red-600 dark:text-red-400">
                            <Trash2 size={20} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">Danger Zone</h2>
                                <p className="text-sm text-muted-foreground mt-1">Manage your local data.</p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Clear all data</p>
                                    <p className="text-xs text-muted-foreground">Permanently remove all jobs and profiles from this browser.</p>
                                </div>
                                <button
                                    onClick={handleDeleteData}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-red-200 dark:border-red-800 bg-background text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm h-9 px-3"
                                >
                                    Delete Data
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="text-center pt-8 text-xs text-muted-foreground">
                    <p>Job OS v1.0.0</p>
                    <p className="mt-1">Open Source • MIT License</p>
                </div>
            </div>
        </div>
    );
}
