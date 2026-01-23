import { type Profile } from '@/types/profile';
import { X } from 'lucide-react';

interface BasicInfoFormProps {
    formData: Profile;
    setFormData: React.Dispatch<React.SetStateAction<Profile>>;
    skillInput: string;
    setSkillInput: (value: string) => void;
    onRemoveSkill: (skill: string) => void;
    onKeyDownSkill: (e: React.KeyboardEvent) => void;
}

export function BasicInfoForm({
    formData,
    setFormData,
    skillInput,
    setSkillInput,
    onRemoveSkill,
    onKeyDownSkill
}: BasicInfoFormProps) {
    return (
        <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Profile Name</label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="e.g. Full Stack V2"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target Role</label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="e.g. Senior Software Engineer"
                            value={formData.targetRole}
                            onChange={e => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Intro */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Intro / Summary</label>
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus:ring-1 focus:ring-ring resize-y"
                    placeholder="Brief professional summary..."
                    value={formData.intro}
                    onChange={e => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                />
            </div>

            {/* Skills */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <div className="min-h-[38px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-ring">
                    {formData.skills.map(skill => (
                        <span key={skill} className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                            {skill}
                            <button
                                type="button"
                                onClick={() => onRemoveSkill(skill)}
                                className="ml-1 rounded-full outline-none hover:bg-zinc-300 dark:hover:bg-zinc-700 p-0.5"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        className="flex-1 bg-transparent outline-none text-sm min-w-[80px] placeholder:text-muted-foreground text-foreground"
                        placeholder="Add skill (Enter)..."
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={onKeyDownSkill}
                    />
                </div>
            </div>
        </div>
    );
}
