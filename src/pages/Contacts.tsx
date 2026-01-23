import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NetworkTable } from '@/components/contacts/NetworkTable';
import { LeadSearch } from '@/components/contacts/LeadSearch';
import { ContactModal } from '@/components/contacts/ContactModal';
import { type Contact } from '@/types/contact';

export function Contacts() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const handleAdd = () => {
        setEditingContact(null);
        setIsModalOpen(true);
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 overflow-auto p-6 bg-zinc-50/30 flex flex-col lg:flex-row gap-6 items-start">
            <ContactModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                contactToEdit={editingContact}
            />

            {/* Section: My Network (Main) */}
            <section className="flex-1 min-w-0 space-y-4 w-full">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900">My Network</h2>
                            <p className="text-sm text-zinc-500">Manage your professional relationships.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Contact
                    </Button>
                </div>

                <NetworkTable onEdit={handleEdit} />
            </section>

            {/* Section: Lead Search (Side) */}
            <LeadSearch />
        </div>
    );
}
