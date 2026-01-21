import { useState, useEffect } from 'react';
import { type Job, JobStatus } from '@/types/job';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/client';
import { X, Copy, Download, RefreshCw, Wand2 } from 'lucide-react';
import { generateResumeDraft, refineResume } from '@/ai/openrouter';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import html2pdf from 'html2pdf.js';

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
    const [draftId, setDraftId] = useState<number | null>(null);
    const [hasCopied, setHasCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Load Draft on Mount
    useEffect(() => {
        const loadDraft = async () => {
            if (isOpen && !initialData) {
                // Only load draft for NEW jobs
                const latestDraft = await db.jobDrafts.orderBy('updatedAt').last();
                if (latestDraft) {
                    setFormData(latestDraft.formData);
                    setDraftId(latestDraft.id!);
                    if (latestDraft.formData.profileId) {
                        setSelectedProfileId(latestDraft.formData.profileId);
                    }
                    console.log("Restored draft:", latestDraft.id);
                } else {
                    // Initialize clean state if no draft
                    setFormData({ ...EMPTY_JOB, dateApplied: new Date(), createdAt: new Date(), updatedAt: new Date() });
                    if (profiles.length > 0) setSelectedProfileId(profiles[0].id!);
                }
            } else if (isOpen && initialData) {
                setFormData({ ...initialData });
                if (initialData.profileId) setSelectedProfileId(initialData.profileId);
            }
        };
        loadDraft();
    }, [isOpen, initialData, profiles]);

    // Autosave Draft
    useEffect(() => {
        if (!isOpen || initialData) return; // Don't autosave when editing existing jobs (handled by explicit save) or closed

        const saveDraft = async () => {
            // Avoid saving empty state immediately
            if (!formData.company && !formData.role && !formData.description) return;

            try {
                const draftData = {
                    formData: { ...formData, profileId: selectedProfileId ? Number(selectedProfileId) : undefined },
                    updatedAt: new Date()
                };

                if (draftId) {
                    await db.jobDrafts.update(draftId, draftData);
                } else {
                    const newId = await db.jobDrafts.add(draftData);
                    setDraftId(newId as number);
                }
            } catch (err) {
                console.error("Failed to autosave draft", err);
            }
        };

        const timeout = setTimeout(saveDraft, 1000); // Debounce 1s
        return () => clearTimeout(timeout);
    }, [formData, selectedProfileId, isOpen, initialData, draftId]);

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

    const handleSave = async () => {
        if (!formData.company || !formData.role) {
            alert("Company and Role are required.");
            return;
        }
        await onSave(formData);

        // Clear draft after successful save
        if (draftId) {
            await db.jobDrafts.delete(draftId);
            setDraftId(null);
        }
    };

    const handleCopyText = async () => {
        if (!formData.resumeSnapshot) return;

        // Construct full text including header if profile selected
        let fullText = formData.resumeSnapshot;

        if (selectedProfileId) {
            const profile = profiles.find(p => p.id === Number(selectedProfileId));
            if (profile) {
                const header = [
                    profile.name.toUpperCase(),
                    [
                        profile.contactInfo?.phone,
                        profile.contactInfo?.email,
                        profile.contactInfo?.location,
                        profile.hrData?.workPreference ? `Open to ${profile.hrData.workPreference}` : ''
                    ].filter(Boolean).join(' ◇ '),
                    [
                        profile.contactInfo?.linkedin ? 'LinkedIn' : '',
                        profile.contactInfo?.github ? 'GitHub' : '',
                        profile.hrData?.noticePeriod ? `Available in ${profile.hrData.noticePeriod}` : ''
                    ].filter(Boolean).join(' ◇ ')
                ].filter(Boolean).join('\n');

                fullText = `${header}\n\n${fullText}`;
            }
        }

        try {
            await navigator.clipboard.writeText(fullText);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('resume-preview-content');
        if (!element) return;

        let filename = 'Resume.pdf';
        if (selectedProfileId) {
            const profile = profiles.find(p => p.id === Number(selectedProfileId));
            if (profile) {
                // User requested: "<My Name>_resume.pdf"
                filename = `${profile.name.replace(/\s+/g, '_')}_Resume.pdf`;
            }
        } else {
            // Fallback if no profile selected
            filename = `${formData.role.replace(/\s+/g, '_')}_${formData.company.replace(/\s+/g, '_')}_Resume.pdf`
        }

        setIsDownloading(true);
        const opt: any = {
            margin: [5, 5, 5, 5], // Reduced from 10mm to 5mm
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
        }).catch((err: any) => {
            console.error('PDF download error:', err);
            setIsDownloading(false);
        });
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
                                        <button
                                            onClick={handleCopyText}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-7 px-2 text-xs gap-1"
                                        >
                                            {hasCopied ? <span className="text-green-600">Copied!</span> : <><Copy size={12} /> Copy Text</>}
                                        </button>
                                        <button
                                            onClick={handleDownloadPDF}
                                            disabled={isDownloading}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-7 px-2 text-xs gap-1 disabled:opacity-50"
                                        >
                                            {isDownloading ? 'Saving...' : <><Download size={12} /> Download PDF</>}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Resume Preview Paper */}
                            <div className="space-y-6">
                                <div className="bg-white border text-xs border-zinc-200 shadow-sm rounded-sm leading-relaxed text-zinc-900 font-serif relative overflow-hidden">
                                    <div id="resume-preview-content" className="bg-white p-6 min-h-[750px]">
                                        <div className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[10px] px-2 py-0 rounded shadow-sm font-sans font-bold uppercase tracking-widest print:hidden" data-html2canvas-ignore="true">
                                            Page 1
                                        </div>
                                        {formData.resumeSnapshot ? (
                                            <div className="prose prose-zinc max-w-none">
                                                {/* Native Header Rendering */}
                                                {selectedProfileId && (() => {
                                                    const profile = profiles.find(p => p.id === Number(selectedProfileId));
                                                    if (!profile) return null;

                                                    // Construct Line 1: Contact & Socials
                                                    const line1Items = [];
                                                    if (profile.contactInfo?.phone) line1Items.push({ text: profile.contactInfo.phone });
                                                    if (profile.contactInfo?.email) line1Items.push({ text: profile.contactInfo.email, href: `mailto:${profile.contactInfo.email}` });
                                                    if (profile.contactInfo?.linkedin) line1Items.push({ text: 'LinkedIn', href: profile.contactInfo.linkedin });
                                                    if (profile.contactInfo?.github) line1Items.push({ text: 'GitHub', href: profile.contactInfo.github });
                                                    if (profile.contactInfo?.website) line1Items.push({ text: 'Portfolio', href: profile.contactInfo.website });

                                                    // Construct Line 2: Location & Availability
                                                    const line2Items = [];
                                                    if (profile.contactInfo?.location) line2Items.push({ text: profile.contactInfo.location });
                                                    if (profile.hrData?.workPreference) line2Items.push({ text: `Open to ${profile.hrData.workPreference}` });
                                                    if (profile.hrData?.noticePeriod) line2Items.push({ text: `Available in ${profile.hrData.noticePeriod}` });

                                                    const renderItems = (items: any[]) => (
                                                        <p className="text-zinc-700 text-[12px] tracking-wide font-medium flex flex-wrap justify-center gap-x-2">
                                                            {items.map((item, index) => (
                                                                <span key={index} className="flex items-center">
                                                                    {item.href ? (
                                                                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 underline decoration-blue-700/30 hover:decoration-blue-900">
                                                                            {item.text}
                                                                        </a>
                                                                    ) : (
                                                                        <span>{item.text}</span>
                                                                    )}
                                                                    {index < items.length - 1 && <span className="ml-2 text-zinc-400">◇</span>}
                                                                </span>
                                                            ))}
                                                        </p>
                                                    );

                                                    return (
                                                        <div className="text-center border-b border-zinc-200 pb-3 mb-5 font-sans">
                                                            <h1 className="text-3xl font-bold uppercase tracking-wide text-zinc-900 mb-2">
                                                                {profile.name}
                                                            </h1>
                                                            <div className="space-y-1.5 mt-5">
                                                                {line1Items.length > 0 && renderItems(line1Items)}
                                                                {line2Items.length > 0 && renderItems(line2Items)}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({ children }: any) => <h2 className="font-bold border-b border-zinc-900 mb-3 pb-2 uppercase tracking-wider text-sm font-sans mt-6 text-left w-full block">{children}</h2>,
                                                        h2: ({ children }: any) => {
                                                            const text = String(children).toLowerCase();
                                                            const isProjects = text.includes('projects');
                                                            return <h2 className={`font-bold border-b border-zinc-900 mb-3 pb-2 uppercase tracking-wider text-sm font-sans text-left w-full block ${isProjects ? 'mt-24' : 'mt-6'}`}>{children}</h2>;
                                                        },
                                                        h3: ({ children }: any) => {
                                                            const text = String(children);
                                                            if (text.includes('|')) {
                                                                const [role, date] = text.split('|').map(s => s.trim());
                                                                return (
                                                                    <div className="flex justify-between items-baseline mt-3 mb-1">
                                                                        <h3 className="font-bold text-sm text-zinc-900">{role}</h3>
                                                                        <span className="text-xs font-medium italic text-zinc-600">{date}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            return <h3 className="font-bold text-sm text-zinc-900 mt-3 mb-1">{children}</h3>;
                                                        },
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
