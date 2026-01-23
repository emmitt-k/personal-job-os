import { MoreHorizontal, Mail, Linkedin, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/client';
import { type Contact } from '@/types/contact';

interface NetworkTableProps {
    onEdit?: (contact: Contact) => void;
}

export function NetworkTable({ onEdit }: NetworkTableProps) {
    const contacts = useLiveQuery(() => db.contacts.toArray());

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusColor = (status: Contact['status']) => {
        switch (status) {
            case 'replied':
            case 'offer':
                return 'bg-green-100 text-green-800 hover:bg-green-100/80';
            case 'contacted':
            case 'interviewing':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
            case 'ghosted':
            case 'rejected':
                return 'bg-red-100 text-red-800 hover:bg-red-100/80';
            default:
                return 'bg-zinc-100 text-zinc-800 hover:bg-zinc-100/80';
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await db.contacts.delete(id);
        } catch (error) {
            console.error("Failed to delete contact:", error);
        }
    };

    if (!contacts) return null;

    return (
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-50/50">
                    <TableRow>
                        <TableHead className="font-medium text-xs uppercase w-[250px]">Name</TableHead>
                        <TableHead className="font-medium text-xs uppercase">Role</TableHead>
                        <TableHead className="font-medium text-xs uppercase">Company</TableHead>
                        <TableHead className="font-medium text-xs uppercase">Status</TableHead>
                        <TableHead className="font-medium text-xs uppercase text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.map((contact) => (
                        <TableRow key={contact.id} className="hover:bg-zinc-50/50">
                            <TableCell className="font-medium text-zinc-900">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs ring-2 ring-white">
                                        {getInitials(contact.name)}
                                    </div>
                                    <div>
                                        {contact.name}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-zinc-600">{contact.role}</TableCell>
                            <TableCell className="text-zinc-600">{contact.company}</TableCell>
                            <TableCell>
                                <Badge variant="secondary" className={`font-medium border-0 ${getStatusColor(contact.status)}`}>
                                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {contact.email && (
                                            <DropdownMenuItem className="gap-2" onClick={() => window.open(`mailto:${contact.email}`)}>
                                                <Mail className="h-4 w-4" /> Email
                                            </DropdownMenuItem>
                                        )}
                                        {contact.linkedin && (
                                            <DropdownMenuItem className="gap-2" onClick={() => window.open(contact.linkedin, '_blank')}>
                                                <Linkedin className="h-4 w-4" /> LinkedIn
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            className="gap-2"
                                            onClick={() => onEdit?.(contact)}
                                        >
                                            <Pencil className="h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2 text-red-600 focus:text-red-600"
                                            onClick={() => contact.id && handleDelete(contact.id)}
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="hover:bg-zinc-50/50">
                        <TableCell colSpan={5} className="text-center text-zinc-500 text-xs py-8">
                            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} found
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
