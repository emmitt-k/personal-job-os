import { type Project } from '@/types/profile';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface ProjectsSectionProps {
    projects: Project[];
    onAdd: () => void;
    onEdit: (proj: Project) => void;
    onRemove: (id: string) => void;
}

export function ProjectsSection({ projects, onAdd, onEdit, onRemove }: ProjectsSectionProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Projects</label>
                <button
                    onClick={onAdd}
                    className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                >
                    <Plus size={14} /> Add Project
                </button>
            </div>
            {projects.length === 0 && (
                <div className="text-sm text-muted-foreground italic">No projects added yet.</div>
            )}
            <div className="space-y-2">
                {projects.map(proj => (
                    <div key={proj.id} className="rounded-md border border-border bg-muted/40 p-3 flex group relative">
                        <div className="flex-1 space-y-1">
                            <div className="font-medium text-sm text-foreground">{proj.name}</div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{proj.description}</p>
                        </div>
                        <button
                            onClick={() => onEdit(proj)}
                            className="absolute top-2 right-8 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => onRemove(proj.id)}
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
