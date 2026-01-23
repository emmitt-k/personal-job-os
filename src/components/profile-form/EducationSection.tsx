import { type Education } from '@/types/profile';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface EducationSectionProps {
    education: Education[];
    onAdd: () => void;
    onEdit: (edu: Education) => void;
    onRemove: (id: string) => void;
}

export function EducationSection({ education, onAdd, onEdit, onRemove }: EducationSectionProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Education</label>
                <button
                    onClick={onAdd}
                    className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                >
                    <Plus size={14} /> Add Education
                </button>
            </div>
            {education.length === 0 && (
                <div className="text-sm text-muted-foreground italic">No education added yet.</div>
            )}
            <div className="space-y-2">
                {education.map(edu => (
                    <div key={edu.id} className="rounded-md border border-border bg-muted/40 p-3 flex group relative">
                        <div className="flex-1 space-y-1">
                            <div className="font-medium text-sm text-foreground">{edu.degree}</div>
                            <div className="text-xs text-muted-foreground">{edu.institution} • {edu.startDate} - {edu.endDate}</div>
                        </div>
                        <button
                            onClick={() => onEdit(edu)}
                            className="absolute top-2 right-8 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => onRemove(edu.id)}
                            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
