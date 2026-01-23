import { type Experience } from '@/types/profile';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface ExperienceSectionProps {
    experience: Experience[];
    onAdd: () => void;
    onEdit: (exp: Experience) => void;
    onRemove: (id: string) => void;
}

export function ExperienceSection({ experience, onAdd, onEdit, onRemove }: ExperienceSectionProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Experience</label>
                <button
                    onClick={onAdd}
                    className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                >
                    <Plus size={14} /> Add Position
                </button>
            </div>
            {experience.length === 0 && (
                <div className="text-sm text-muted-foreground italic">No experience added yet.</div>
            )}
            <div className="space-y-2">
                {experience.map(exp => (
                    <div key={exp.id} className="rounded-md border border-border bg-muted/40 p-3 flex group relative">
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-foreground">{exp.role}</span>
                                <span className="text-muted-foreground text-xs">at</span>
                                <span className="font-medium text-sm text-foreground">{exp.company}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{exp.startDate} - {exp.endDate || 'Present'}</div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{exp.description}</p>
                        </div>
                        <button
                            onClick={() => onEdit(exp)}
                            className="absolute top-2 right-8 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => onRemove(exp.id)}
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
