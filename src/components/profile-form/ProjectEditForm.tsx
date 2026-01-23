import { type Project } from '@/types/profile';
import { X } from 'lucide-react';

interface ProjectEditFormProps {
    data: Partial<Project>;
    setData: React.Dispatch<React.SetStateAction<Partial<Project>>>;
    onSave: () => void;
    onCancel: () => void;
}

export function ProjectEditForm({ data, setData, onSave, onCancel }: ProjectEditFormProps) {
    return (
        <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                    {data.id ? 'Edit Project' : 'Add Project'}
                </h2>
                <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={data.name || ''}
                        onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">URL (Optional)</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={data.url || ''}
                        onChange={e => setData(prev => ({ ...prev, url: e.target.value }))}
                    />
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
                    Save Project
                </button>
            </div>
        </>
    );
}
