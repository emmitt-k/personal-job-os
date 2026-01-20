import { useState, useEffect } from 'react';
import { type Job, JobStatus } from '@/types/job';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/client';
import { X, Copy, Download, RefreshCw, Wand2 } from 'lucide-react';
import { generateResumeDraft, refineResume } from '@/ai/openrouter';
import ReactMarkdown from 'react-markdown';

interface JobFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (job: Job) => Promise<void>;
    initialData?: Job | null;
}

const EMPTY_JOB: Job = {
    company: '',
    role: '',
    status: 'Saved',
    source: '',
    location: '',
    dateApplied: new Date(),
    description: '',
    resumeSnapshot: '',
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
};

export function JobForm({ isOpen, onClose, onSave, initialData }: JobFormProps) {
    const profiles = useLiveQuery(() => db.profiles.toArray()) || [];

    // Form State
    const [formData, setFormData] = useState<Job>(EMPTY_JOB);

    // AI / Resume State
    const [activeTab, setActiveTab] = useState<'draft' | 'refine'>('draft');
    const [selectedProfileId, setSelectedProfileId] = useState<number | ''>('');
    const [refineInstructions, setRefineInstructions] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? { ...initialData } : { ...EMPTY_JOB, dateApplied: new Date(), createdAt: new Date(), updatedAt: new Date() });
            // Select first profile by default if none selected and creating new
            if (!initialData && profiles.length > 0 && !selectedProfileId) {
                if (profiles.length > 0) setSelectedProfileId(profiles[0].id!);
            }
            if (initialData?.profileId) {
                setSelectedProfileId(initialData.profileId);
            }
        }
    }, [isOpen, initialData, profiles]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!selectedProfileId) {
            alert("Please select a profile first.");
            return;
        }
        if (!formData.description) {
            alert("Please provide a job description.");
            return;
        }

        setIsGenerating(true);
        try {
            const profile = profiles.find(p => p.id === Number(selectedProfileId));
            if (!profile) throw new Error("Profile not found");

            const generatedResume = await generateResumeDraft(profile, {
                company: formData.company,
                role: formData.role,
                description: formData.description
            });

            setFormData(prev => ({ ...prev, resumeSnapshot: generatedResume, profileId: Number(selectedProfileId) }));
            setActiveTab('refine');
        } catch (error: any) {
            console.error("Creation failed", error);
            alert(error.message || "Failed to generate resume.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefine = async () => {
        if (!refineInstructions.trim() || !formData.resumeSnapshot) return;

        setIsGenerating(true);
        try {
            const refined = await refineResume(formData.resumeSnapshot, refineInstructions);
            setFormData(prev => ({
                ...prev,
                resumeSnapshot: refined
            }));
            setRefineInstructions('');
        } catch (error: any) {
            console.error("Refinement failed", error);
            alert(error.message || "Failed to refine resume.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!formData.company || !formData.role) {
            alert("Company and Role are required.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 backdrop-blur-sm p-4 sm:p-6 fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-zinc-200 flex flex-col h-[90vh] max-h-[900px] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            {initialData ? 'Edit Job' : 'Add New Job'}
                        </h2>
                        <p className="text-sm text-zinc-500">Track a new job and generate a tailored resume.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-100 hover:text-zinc-900 h-8 w-8 p-0 text-zinc-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body (2 Columns) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 overflow-hidden">

                    {/* LEFT: Job Details */}
                    <div className="p-6 overflow-y-auto space-y-6 bg-white">
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
                                className="flex min-h-[300px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus:ring-1 focus:ring-zinc-950 resize-y font-mono text-xs"
                                placeholder="Paste the full job description here..."
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* RIGHT: AI Resume */}
                    <div className="bg-zinc-50/50 flex flex-col h-full overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-200 bg-white/50">

                            {/* Tabs */}
                            <div className="flex p-1 bg-zinc-100 rounded-lg mb-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('draft')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'draft' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    New Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('refine')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'refine' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    Refine AI
                                </button>
                            </div>

                            {/* Controls */}
                            {activeTab === 'draft' ? (
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 flex items-center gap-2">
                                        <span className="text-xs font-medium text-zinc-500 whitespace-nowrap">Profile:</span>
                                        <select
                                            className="flex-1 h-8 rounded-md border border-zinc-200 bg-white text-sm px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                                            value={selectedProfileId}
                                            onChange={e => setSelectedProfileId(Number(e.target.value))}
                                        >
                                            <option value="" disabled>Select Profile</option>
                                            {profiles.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.targetRole})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-8 px-3 text-xs shadow-sm"
                                    >
                                        {isGenerating ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : <Wand2 className="mr-2 h-3 w-3" />}
                                        Generate Draft
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Verbal Instructions (AI)</label>
                                        <div className="flex gap-2">
                                            <textarea
                                                className="flex-1 min-h-[60px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus:ring-1 focus:ring-zinc-950 resize-none"
                                                placeholder="e.g. 'Make the summary more punchy', 'Highlight my Python experience more'"
                                                value={refineInstructions}
                                                onChange={e => setRefineInstructions(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRefine}
                                                disabled={isGenerating}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-auto px-4 text-xs shadow-sm flex-col py-2 gap-1 uppercase tracking-tight"
                                            >
                                                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                                Refine
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-zinc-900">Preview</h4>
                                    <div className="flex gap-2">
                                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-7 px-2 text-xs gap-1">
                                            <Copy size={12} /> Copy Text
                                        </button>
                                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-7 px-2 text-xs gap-1">
                                            <Download size={12} /> Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Resume Preview Paper */}
                            <div className="space-y-6">
                                <div className="bg-white border border-zinc-200 shadow-sm p-8 min-h-[750px] rounded-sm text-[11px] leading-relaxed text-zinc-800 font-serif relative">
                                    <div className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-sans font-bold uppercase tracking-widest">
                                        Page 1
                                    </div>
                                    {formData.resumeSnapshot ? (
                                        <div className="prose prose-zinc max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({ children }: any) => <h1 className="text-lg font-bold uppercase tracking-wide text-center border-b border-zinc-200 pb-4 mb-4 font-sans">{children}</h1>,
                                                    h2: ({ children }: any) => <h2 className="font-bold border-b border-zinc-900 mb-2 uppercase tracking-wider text-xs font-sans mt-4">{children}</h2>,
                                                    h3: ({ children }: any) => <h3 className="font-bold text-xs mt-2">{children}</h3>,
                                                    ul: ({ children }: any) => <ul className="list-disc list-outside ml-4 space-y-1 mb-2">{children}</ul>,
                                                    li: ({ children }: any) => <li className="pl-1">{children}</li>,
                                                    p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    hr: () => <hr className="my-4 border-zinc-200" />,
                                                }}
                                            >
                                                {formData.resumeSnapshot}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-[600px] text-zinc-400 space-y-4">
                                            <Wand2 size={48} className="opacity-20" />
                                            <p className="text-sm text-center max-w-[200px]">
                                                Select a profile and click "Generate Draft" to create a tailored resume.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-100 hover:text-zinc-900 h-9 px-4 py-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-9 px-4 py-2 shadow"
                    >
                        Save Application
                    </button>
                </div>

            </div>
        </div>
    );
}
