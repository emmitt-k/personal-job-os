import { type Education } from '@/types/profile';
import { X } from 'lucide-react';

interface EducationEditFormProps {
    data: Partial<Education>;
    setData: React.Dispatch<React.SetStateAction<Partial<Education>>>;
    onSave: () => void;
    onCancel: () => void;
}

export function EducationEditForm({ data, setData, onSave, onCancel }: EducationEditFormProps) {
    return (
        <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                    {data.id ? 'Edit Education' : 'Add Education'}
                </h2>
                <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                    <label className="text-sm font-medium">School / Institution</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={data.institution || ''}
                        onChange={e => setData(prev => ({ ...prev, institution: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Degree / Field of Study</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={data.degree || ''}
                        onChange={e => setData(prev => ({ ...prev, degree: e.target.value }))}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start Year</label>
                        <input
                            type="text"
                            placeholder="YYYY"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            value={data.startDate || ''}
                            onChange={e => setData(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Year</label>
                        <input
                            type="text"
                            placeholder="YYYY"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            value={data.endDate || ''}
                            onChange={e => setData(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/30 gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md"
                >
                    Back
                </button>
                <button
                    onClick={onSave}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-sm"
                >
                    Save Education
                </button>
            </div>
        </>
    );
}
