import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { db } from '@/db/client';
import { type Contact } from '@/types/contact';

interface ContactModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contactToEdit?: Contact | null;
}

export function ContactModal({ open, onOpenChange, contactToEdit }: ContactModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Contact>>({
        name: '',
        role: '',
        company: '',
        email: '',
        linkedin: '',
        relationshipStrength: 'weak',
        notes: '',
        status: 'contacted'
    });

    useEffect(() => {
        if (contactToEdit) {
            setFormData({
                name: contactToEdit.name,
                role: contactToEdit.role,
                company: contactToEdit.company,
                email: contactToEdit.email || '',
                linkedin: contactToEdit.linkedin || '',
                relationshipStrength: contactToEdit.relationshipStrength,
                notes: contactToEdit.notes || '',
                status: contactToEdit.status
            });
        } else {
            setFormData({
                name: '',
                role: '',
                company: '',
                email: '',
                linkedin: '',
                relationshipStrength: 'weak',
                notes: '',
                status: 'contacted'
            });
        }
    }, [contactToEdit, open]);

    const handleChange = (field: keyof Contact, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name) return; // Basic validation

        try {
            setLoading(true);
            const contactData = {
                name: formData.name!,
                role: formData.role || '',
                company: formData.company || '',
                email: formData.email,
                linkedin: formData.linkedin,
                status: (formData.status as any) || 'contacted',
                relationshipStrength: (formData.relationshipStrength as any) || 'weak',
                notes: formData.notes,
                updatedAt: new Date()
            };

            if (contactToEdit && contactToEdit.id) {
                // Update existing
                await db.contacts.update(contactToEdit.id, contactData);
            } else {
                // Create new
                await db.contacts.add({
                    ...contactData,
                    createdAt: new Date()
                } as Contact);
            }

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save contact:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{contactToEdit ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Alex Johnson"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                placeholder="e.g. Recruiter"
                                value={formData.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                placeholder="e.g. OpenAI"
                                value={formData.company}
                                onChange={(e) => handleChange('company', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="alex@example"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                                id="linkedin"
                                placeholder="linkedin.com/in/..."
                                value={formData.linkedin}
                                onChange={(e) => handleChange('linkedin', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship Strength</Label>
                        <Select
                            value={formData.relationshipStrength}
                            onValueChange={(val) => handleChange('relationshipStrength', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select strength" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weak">Weak (No contact yet)</SelectItem>
                                <SelectItem value="moderate">Moderate (Replied once)</SelectItem>
                                <SelectItem value="strong">Strong (Known contact)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add background, meeting notes, etc..."
                            className="resize-none min-h-[80px]"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-zinc-900 text-white hover:bg-zinc-800"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (contactToEdit ? 'Update Contact' : 'Save Contact')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
