import React from 'react';
import { type Job, JobStatus } from '@/types/job';

interface JobDetailsFormProps {
    formData: Job;
    setFormData: (data: Job) => void;
    handleDescriptionPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export function JobDetailsForm({ formData, setFormData, handleDescriptionPaste }: JobDetailsFormProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Job Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Company</label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus:ring-1 focus:ring-zinc-950"
                            placeholder="e.g. Acme Corp"
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Role Title</label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus:ring-1 focus:ring-zinc-950"
                            placeholder="e.g. Frontend Engineer"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Status</label>
                        <select
                            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-zinc-950"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            {Object.values(JobStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Source</label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus:ring-1 focus:ring-zinc-950"
                            placeholder="e.g. LinkedIn"
                            value={formData.source}
                            onChange={e => setFormData({ ...formData, source: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Job Description</h3>
                    {/* <button className="text-xs text-blue-600 hover:underline">Paste via Clipboard</button> */}
                </div>
                <textarea
                    className="flex min-h-[150px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus:ring-1 focus:ring-zinc-950 resize-y font-mono text-xs"
                    placeholder="Paste the full job description here..."
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    onPaste={handleDescriptionPaste}
                />
            </div>
        </div>
    );
}
