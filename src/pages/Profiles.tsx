import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/client';
import { type Profile } from '@/types/profile';
import { ProfileCard } from '@/components/ProfileCard';
import { ProfileForm } from '@/components/ProfileForm';
import { ImportResumeModal } from '@/components/ImportResumeModal';
import { parseResumeWithAI } from '@/ai/resume';
import { Plus, Download } from 'lucide-react';

export function Profiles() {
    const profiles = useLiveQuery(() => db.profiles.toArray());
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

    const handleCreateWrapper = () => {
        setEditingProfile(null);
        setIsProfileModalOpen(true);
    };

    const handleEditWrapper = (profile: Profile) => {
        setEditingProfile(profile);
        setIsProfileModalOpen(true);
    };

    const handleSaveWrapper = async (profileData: Profile) => {
        try {
            if (profileData.id) {
                await db.profiles.update(profileData.id, profileData as any);
            } else {
                await db.profiles.add({ ...profileData, updatedAt: new Date() });
            }
            setIsProfileModalOpen(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
        }
    };

    const handleAnalyzeResume = async (text: string) => {
        try {
            const profile = await parseResumeWithAI(text);
            setIsImportModalOpen(false);
            setEditingProfile(profile);
            setIsProfileModalOpen(true);
        } catch (error: any) {
            console.error("Analysis failed:", error);
            alert(error.message || "Failed to analyze resume.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-foreground">Profiles</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 shadow-sm"
                    >
                        <Download size={16} className="mr-2" />
                        Import from Resume
                    </button>
                    <button
                        onClick={handleCreateWrapper}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 shadow-sm"
                    >
                        <Plus size={16} className="mr-2" />
                        Create Profile
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles?.map((profile) => (
                        <ProfileCard
                            key={profile.id}
                            profile={profile}
                            onEdit={handleEditWrapper}
                        />
                    ))}

                    {/* Create New Card (Empty State / Shortcut) */}
                    <button
                        onClick={handleCreateWrapper}
                        className="rounded-lg border border-dashed border-border bg-card/50 p-6 flex flex-col items-center justify-center text-center hover:bg-accent transition-colors h-full min-h-[200px] group"
                    >
                        <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground mb-3 shadow-sm group-hover:text-foreground group-hover:border-foreground/50 transition-colors">
                            <Plus size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-foreground">Create New Profile</h3>
                        <p className="text-xs text-muted-foreground mt-1">Tailor your experience for a different role type.</p>
                    </button>
                </div>
            </div>

            <ProfileForm
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={handleSaveWrapper}
                initialData={editingProfile}
            />

            <ImportResumeModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onAnalyze={handleAnalyzeResume}
            />
        </div>
    );
}
