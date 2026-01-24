import { useState, useEffect } from 'react';
import { RefreshCw, Wand2, Copy, Download, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import html2pdf from 'html2pdf.js';

import { type Profile } from '@/types/profile';
import { generateResumeDraft, refineResume } from '@/ai/resume';

interface ResumeBuilderProps {
    // Data
    profiles: Profile[];
    jobDetails: {
        company: string;
        role: string;
        description: string;
    };
    keywords: string[];

    // Resume State (Controlled by Parent)
    resumeSnapshot: string;
    onUpdateResume: (text: string, profileId?: number) => void;

    // Initial State
    initialProfileId?: number;
}

export function ResumeBuilder({
    profiles,
    jobDetails,
    keywords,
    resumeSnapshot,
    onUpdateResume,
    initialProfileId
}: ResumeBuilderProps) {
    // Tab State (Draft / Refine)
    const [subTab, setSubTab] = useState<'draft' | 'refine'>('draft');

    // Generator State
    const [selectedProfileId, setSelectedProfileId] = useState<number | ''>(initialProfileId || '');
    const [refineInstructions, setRefineInstructions] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Preview/Edit State
    const [isEditingResume, setIsEditingResume] = useState(false);
    const [tempResumeText, setTempResumeText] = useState('');
    const [hasCopied, setHasCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Sync initial profile id if provided later
    useEffect(() => {
        if (initialProfileId) setSelectedProfileId(initialProfileId);
    }, [initialProfileId]);

    // --- Actions ---

    const handleGenerate = async () => {
        if (!selectedProfileId) {
            alert("Please select a profile first.");
            return;
        }
        if (!jobDetails.description) {
            alert("Please provide a job description in the Job Details tab.");
            return;
        }

        setIsGenerating(true);
        try {
            const profile = profiles.find(p => p.id === Number(selectedProfileId));
            if (!profile) throw new Error("Profile not found");

            const generatedResume = await generateResumeDraft(profile, {
                company: jobDetails.company,
                role: jobDetails.role,
                description: jobDetails.description
            }, keywords);

            onUpdateResume(generatedResume, Number(selectedProfileId));
            setSubTab('refine'); // Switch to refine after generation
        } catch (error: any) {
            console.error("Creation failed", error);
            alert(error.message || "Failed to generate resume.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefine = async () => {
        if (!refineInstructions.trim() || !resumeSnapshot) return;

        setIsGenerating(true);
        try {
            const refined = await refineResume(resumeSnapshot, refineInstructions);
            onUpdateResume(refined);
            setRefineInstructions('');
        } catch (error: any) {
            console.error("Refinement failed", error);
            alert(error.message || "Failed to refine resume.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyText = async () => {
        if (!resumeSnapshot) return;

        // Construct full text including header if profile selected
        let fullText = resumeSnapshot;

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

    const handleDownloadPDF = async () => {
        const element = document.getElementById('resume-preview-content');
        if (!element) return;

        setIsDownloading(true);
        // Wait for render to update styles (hide page break markings)
        await new Promise(resolve => setTimeout(resolve, 100));

        let filename = 'resume.pdf';
        if (selectedProfileId) {
            const profile = profiles.find(p => p.id === Number(selectedProfileId));
            if (profile) {
                const safeName = profile.name.trim().replace(/\s+/g, '_');
                filename = `${safeName}_resume.pdf`;
            }
        } else {
            filename = `${jobDetails.company || 'Resume'}_${jobDetails.role || 'Job'}_resume.pdf`;
        }

        const options: any = {
            margin: [5, 5, 5, 5],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        try {
            await html2pdf().set(options).from(element).save();
        } catch (error) {
            console.error("PDF generation failed", error);
        } finally {
            setIsDownloading(false);
        }
    };

    // --- Edit Mode Helpers ---

    const handleEnterEditMode = () => {
        setTempResumeText(resumeSnapshot || '');
        setIsEditingResume(true);
    };

    const handleSaveEdit = () => {
        onUpdateResume(tempResumeText);
        setIsEditingResume(false);
    };

    const handleCancelEdit = () => {
        setTempResumeText('');
        setIsEditingResume(false);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50/50">
            {/* Top Controls: Generator/Refiner */}
            <div className="px-4 py-3 border-b border-zinc-200 bg-white/50">
                {/* Sub-Tabs: New Draft vs Refine */}
                <div className="flex p-1 bg-zinc-100 rounded-lg mb-4">
                    <button
                        type="button"
                        onClick={() => setSubTab('draft')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${subTab === 'draft' ? 'bg-white shadow-sm' : ''}`}
                    >
                        New Draft
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubTab('refine')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${subTab === 'refine' ? 'bg-white shadow-sm' : ''}`}
                    >
                        Refine AI
                    </button>
                </div>

                {subTab === 'draft' ? (
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

            {/* Preview Section */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-zinc-900">Preview</h4>
                        <div className="flex gap-2">
                            {isEditingResume ? (
                                <>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-red-700 h-7 px-3 text-xs gap-1"
                                    >
                                        <X size={12} /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-7 px-3 text-xs gap-1 shadow-sm"
                                    >
                                        <Wand2 size={12} /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleEnterEditMode}
                                        disabled={!resumeSnapshot}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-7 px-2 text-xs gap-1 disabled:opacity-50"
                                    >
                                        <Wand2 size={12} /> Edit Text
                                    </button>
                                    <button
                                        onClick={handleCopyText}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-7 px-2 text-xs gap-1"
                                    >
                                        {hasCopied ? <span className="text-green-600">Copied!</span> : <><Copy size={12} /> Copy Text</>}
                                    </button>
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloading || !resumeSnapshot}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-7 px-2 text-xs gap-1 disabled:opacity-50"
                                    >
                                        {isDownloading ? 'Saving...' : <><Download size={12} /> Download PDF</>}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resume Paper */}
                <div className="flex justify-center bg-gray-100/50 p-4 rounded-lg overflow-y-auto overflow-x-hidden max-h-[800px]">
                    <div className="bg-white border text-sm border-zinc-200 shadow-md transform scale-[0.55] sm:scale-[0.7] lg:scale-[0.6] xl:scale-[0.75] 2xl:scale-[0.85] origin-top text-zinc-900 font-sans relative transition-transform duration-200" style={{ width: '210mm', minHeight: '297mm' }}>
                        <div id="resume-preview-content" className="bg-white p-6">

                            {/* Page Marker (Visual Only) */}
                            <div className="absolute top-2 right-2 bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded font-sans uppercase tracking-widest print:hidden border border-gray-200" data-html2canvas-ignore="true">
                                {isEditingResume ? 'Editing...' : 'Preview'}
                            </div>

                            {isEditingResume ? (
                                <textarea
                                    className="w-full h-[800px] resize-none font-mono text-sm focus:outline-none p-2 border border-blue-200 rounded bg-blue-50/10 text-zinc-700"
                                    value={tempResumeText}
                                    onChange={(e) => setTempResumeText(e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                resumeSnapshot ? (
                                    <div className="prose prose-zinc max-w-none">
                                        {/* Header */}
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
                                                <p className="text-zinc-700 text-sm tracking-wide font-medium flex flex-wrap justify-center gap-x-2">
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
                                                <div className="text-center mb-5 font-sans">
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
                                                h1: ({ children }: any) => <h2 className="font-bold border-b border-zinc-900 mb-3 pb-2 uppercase tracking-wider text-base font-sans mt-6 text-left w-full block">{children}</h2>,
                                                h2: ({ children }: any) => {
                                                    return (
                                                        <h2 className="font-bold border-b border-zinc-900 mb-3 pb-2 uppercase tracking-wider text-base font-sans mt-6 text-left w-full block">
                                                            {children}
                                                        </h2>
                                                    );
                                                },
                                                h3: ({ children }: any) => {
                                                    const text = String(children);
                                                    if (text.includes('|')) {
                                                        const [role, date] = text.split('|').map(s => s.trim());
                                                        return (
                                                            <div className="flex justify-between items-baseline mt-3 mb-1">
                                                                <h3 className="font-bold text-base text-zinc-900">{role}</h3>
                                                                <span className="text-sm font-medium italic text-zinc-600">{date}</span>
                                                            </div>
                                                        );
                                                    }
                                                    return <h3 className="font-bold text-base text-zinc-900 mt-3 mb-1">{children}</h3>;
                                                },
                                                ul: ({ children }: any) => <ul className="list-disc list-outside ml-4 space-y-1 mb-2">{children}</ul>,
                                                li: ({ children }: any) => <li className="pl-1">{children}</li>,
                                                p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
                                                hr: () => (
                                                    <div className={`html2pdf__page-break relative w-[calc(100%+3rem)] -ml-6 h-8 my-8 flex items-center justify-between px-4 ${isDownloading ? 'opacity-0' : 'bg-zinc-100/50 border-y border-zinc-200 shadow-inner'}`}>
                                                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-sans">End of Page 1</span>
                                                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-sans">Page 2</span>
                                                    </div>
                                                ),
                                            }}
                                        >
                                            {resumeSnapshot}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[600px] text-zinc-400 space-y-4">
                                        <Wand2 size={48} className="opacity-20" />
                                        <p className="text-sm text-center max-w-[200px]">
                                            Select a profile and click "Generate Draft" to create a tailored resume.
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

