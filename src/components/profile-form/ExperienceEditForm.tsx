import { type Experience } from '@/types/profile';
import { X } from 'lucide-react';

interface ExperienceEditFormProps {
    data: Partial<Experience>;
    setData: React.Dispatch<React.SetStateAction<Partial<Experience>>>;
    onSave: () => void;
    onCancel: () => void;
}

export function ExperienceEditForm({ data, setData, onSave, onCancel }: ExperienceEditFormProps) {
    return (
        <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                    {data.id ? 'Edit Experience' : 'Add Experience'}
                </h2>
                <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={data.company || ''}
                        onChange={e => setData(prev => ({ ...prev, company: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Role Title</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={data.role || ''}
                        onChange={e => setData(prev => ({ ...prev, role: e.target.value }))}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <input
                            type="text"
                            placeholder="MM/YYYY"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            value={data.startDate || ''}
                            onChange={e => setData(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <input
                            type="text"
                            placeholder="Present"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            value={data.endDate || ''}
                            onChange={e => setData(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                        value={data.description || ''}
                        onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
                    />
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
                    Save Position
                </button>
            </div>
        </>
    );
}
