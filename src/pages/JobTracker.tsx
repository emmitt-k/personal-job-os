import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/client';
import { JobStatus, type Job } from '@/types/job';
import { Search, ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { JobForm } from '@/components/JobForm';

export default function JobTracker() {
    const jobs = useLiveQuery(() => db.jobs.toArray());
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All');

    // Modal State
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    // Filter logic
    const filteredJobs = jobs?.filter(job => {
        const matchesSearch =
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateJob = () => {
        setEditingJob(null);
        setIsJobModalOpen(true);
    };

    const handleEditJob = (job: Job) => {
        setEditingJob(job);
        setIsJobModalOpen(true);
    };

    const handleSaveJob = async (jobData: Job) => {
        try {
            if (jobData.id) {
                await db.jobs.update(jobData.id, jobData as any);
            } else {
                await db.jobs.add({ ...jobData, createdAt: new Date(), updatedAt: new Date() });
            }
            setIsJobModalOpen(false);
        } catch (error) {
            console.error("Failed to save job:", error);
            alert("Failed to save job.");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this job?')) {
            await db.jobs.delete(id);
        }
    };

    const handleStatusChange = async (id: number, newStatus: JobStatus) => {
        await db.jobs.update(id, { status: newStatus });
    };

    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case JobStatus.Saved: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
            case JobStatus.Applied: return 'bg-blue-100 text-blue-800 border-blue-200';
            case JobStatus.Interview: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case JobStatus.Offer: return 'bg-green-100 text-green-800 border-green-200';
            case JobStatus.Rejected: return 'bg-red-100 text-red-800 border-red-200';
            case JobStatus.Ghosted: return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-zinc-100 text-zinc-800';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Toolbar */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search company, role..."
                            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1 border-l border-border pl-4">
                        <div className="relative group">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-2 text-muted-foreground">
                                <span className="mr-2 text-xs font-medium">Status: {statusFilter}</span>
                                <ChevronDown size={14} />
                            </button>
                            {/* Simple Dropdown for Filter */}
                            <div className="absolute top-full left-0 mt-1 w-32 bg-popover rounded-md border border-border shadow-md hidden group-hover:block z-10">
                                <div className="p-1">
                                    {['All', ...Object.values(JobStatus)].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status as any)}
                                            className="w-full text-left px-2 py-1.5 text-xs rounded-sm hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 shadow-sm"
                    onClick={handleCreateJob}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                </button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-muted/30">
                <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground group/th">
                                    <div className="flex items-center gap-1">
                                        Company
                                    </div>
                                </th>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground group/th">
                                    <div className="flex items-center gap-1">
                                        Role
                                    </div>
                                </th>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground group/th">
                                    <div className="flex items-center gap-1">
                                        Status
                                    </div>
                                </th>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground group/th">
                                    <div className="flex items-center gap-1">
                                        Applied
                                    </div>
                                </th>
                                <th className="px-4 py-3 font-medium">Source</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredJobs?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                                        No jobs found. Start by adding one!
                                    </td>
                                </tr>
                            )}
                            {filteredJobs?.map((job) => (
                                <tr key={job.id} className="hover:bg-muted/50 transition-colors group">
                                    <td className="px-4 py-3 font-medium text-foreground">{job.company}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{job.role}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={job.status}
                                            onChange={(e) => handleStatusChange(job.id!, e.target.value as JobStatus)}
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-none focus:ring-0 cursor-pointer appearance-none text-center min-w-[80px] ${getStatusColor(job.status)}`}
                                        >
                                            {Object.values(JobStatus).map(s => (
                                                <option key={s} value={s}>{s.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                        {job.dateApplied ? format(new Date(job.dateApplied), 'yyyy-MM-dd') : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{job.source}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditJob(job)}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                                            >
                                                <Pencil size={14} className="text-muted-foreground" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job.id!)}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-red-50 hover:text-destructive h-8 w-8 p-0"
                                            >
                                                <Trash2 size={14} className="text-destructive opacity-70" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <JobForm
                isOpen={isJobModalOpen}
                onClose={() => setIsJobModalOpen(false)}
                onSave={handleSaveJob}
                initialData={editingJob}
            />
        </div>
    );
}
