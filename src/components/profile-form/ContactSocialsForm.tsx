import { type Profile } from '@/types/profile';

interface ContactSocialsFormProps {
    formData: Profile;
    setFormData: React.Dispatch<React.SetStateAction<Profile>>;
}

export function ContactSocialsForm({ formData, setFormData }: ContactSocialsFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="+1 (555) 000-0000"
                        value={formData.contactInfo?.phone || ''}
                        onChange={e => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, phone: e.target.value } }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                        type="email"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="you@example.com"
                        value={formData.contactInfo?.email || ''}
                        onChange={e => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, email: e.target.value } }))}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="City, Country"
                        value={formData.contactInfo?.location || ''}
                        onChange={e => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, location: e.target.value } }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Work Preference</label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                        value={formData.hrData?.workPreference || 'Remote'}
                        onChange={e => setFormData(prev => ({ ...prev, hrData: { ...prev.hrData, workPreference: e.target.value as any } }))}
                    >
                        <option value="Remote">Remote</option>
                        <option value="On-Site">On-Site</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">LinkedIn</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="in/username"
                        value={formData.contactInfo?.linkedin || ''}
                        onChange={e => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, linkedin: e.target.value } }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">GitHub</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="username"
                        value={formData.contactInfo?.github || ''}
                        onChange={e => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, github: e.target.value } }))}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Portfolio / Website</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="https://..."
                        value={formData.contactInfo?.website || ''}
                        onChange={e => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, website: e.target.value } }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Notice Period</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="e.g. 2 Weeks"
                        value={formData.hrData?.noticePeriod || ''}
                        onChange={e => setFormData(prev => ({ ...prev, hrData: { ...prev.hrData, noticePeriod: e.target.value } }))}
                    />
                </div>
            </div>
        </div>
    );
}
