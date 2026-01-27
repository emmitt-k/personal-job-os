import { type Profile } from '@/types/profile';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';

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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setFormData(prev => ({ ...prev, photo: undefined }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            {/* Photo Upload */}
            <div className="flex items-center gap-6">
                <div className="relative group shrink-0">
                    <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center overflow-hidden bg-muted ${!formData.photo ? 'border-dashed border-zinc-300' : 'border-solid border-zinc-200'}`}>
                        {formData.photo ? (
                            <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="text-zinc-400" size={32} />
                        )}
                    </div>
                    {formData.photo && (
                        <button
                            onClick={removePhoto}
                            className="absolute -top-1 -right-1 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors border border-red-200 shadow-sm"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Photo</label>
                    <p className="text-xs text-muted-foreground">Recommended: Square JPG or PNG, max 1MB.</p>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-xs gap-2"
                        >
                            <Upload size={14} /> Upload Photo
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-border" />
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
