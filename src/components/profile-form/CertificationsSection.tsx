import { type Certification } from '@/types/profile';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface CertificationsSectionProps {
    certifications: Certification[];
    onAdd: () => void;
    onEdit: (cert: Certification) => void;
    onRemove: (id: string) => void;
}

export function CertificationsSection({ certifications, onAdd, onEdit, onRemove }: CertificationsSectionProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Certifications</label>
                <button
                    onClick={onAdd}
                    className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                >
                    <Plus size={14} /> Add Certification
                </button>
            </div>
            {(!certifications || certifications.length === 0) && (
                <div className="text-sm text-muted-foreground italic">No certifications added yet.</div>
            )}
            <div className="space-y-2">
                {certifications?.map(cert => (
                    <div key={cert.id} className="rounded-md border border-border bg-muted/40 p-3 flex group relative">
                        <div className="flex-1 space-y-1">
                            <div className="font-medium text-sm text-foreground">{cert.name}</div>
                            <div className="text-xs text-muted-foreground">{cert.issuer} • {cert.year}</div>
                        </div>
                        <button
                            onClick={() => onEdit(cert)}
                            className="absolute top-2 right-8 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => onRemove(cert.id)}
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
