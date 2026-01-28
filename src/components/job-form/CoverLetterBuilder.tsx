import { useState, useEffect } from 'react';
import { RefreshCw, Wand2, Copy, Download, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import html2pdf from 'html2pdf.js';

import { type Profile } from '@/types/profile';
import { generateCoverLetter } from '@/ai/coverLetter';

interface CoverLetterBuilderProps {
    profiles: Profile[];
    jobDetails: {
        company: string;
        role: string;
        description: string;
    };
    coverLetterSnapshot: string;
    onUpdateCoverLetter: (text: string) => void;
    initialProfileId?: number;
}

export function CoverLetterBuilder({
    profiles,
    jobDetails,
    coverLetterSnapshot,
    onUpdateCoverLetter,
    initialProfileId
}: CoverLetterBuilderProps) {
    const [selectedProfileId, setSelectedProfileId] = useState<number | ''>(initialProfileId || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempText, setTempText] = useState('');
    const [hasCopied, setHasCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (initialProfileId) setSelectedProfileId(initialProfileId);
    }, [initialProfileId]);

    const handleGenerate = async () => {
        if (!selectedProfileId) {
            alert("Please select a profile first.");
            return;
        }
        if (!jobDetails.description) {
            alert("Please provide a job description.");
            return;
        }

        setIsGenerating(true);
        // Reset or clear if you want fresh text, but often keeping old text until new text starts is fine. 
        // We'll reset here to show it's starting fresh.
        onUpdateCoverLetter("");

        try {
            const profile = profiles.find(p => p.id === Number(selectedProfileId));
            if (!profile) throw new Error("Profile not found");

            let accumulatedText = "";
            await generateCoverLetter(profile, jobDetails, (chunk) => {
                accumulatedText += chunk;
                onUpdateCoverLetter(accumulatedText);
            });
        } catch (error: any) {
            console.error("Cover Letter error", error);
            alert(error.message || "Failed to generate cover letter.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyText = async () => {
        if (!coverLetterSnapshot) return;
        try {
            await navigator.clipboard.writeText(coverLetterSnapshot);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('cover-letter-preview-content');
        if (!element) return;

        setIsDownloading(true);
        const filename = `${jobDetails.company || 'Company'}_CoverLetter.pdf`;

        const options: any = {
            margin: [10, 10, 10, 10],
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

    // Edit Mode
    const handleEnterEditMode = () => {
        setTempText(coverLetterSnapshot || '');
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        onUpdateCoverLetter(tempText);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setTempText('');
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50/50">
            {/* Top Controls */}
            <div className="px-4 py-3 border-b border-zinc-200 bg-white/50">
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
                        Generate
                    </button>
                </div>
            </div>

            {/* Preview / Edit Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-zinc-900">Preview</h4>
                        <div className="flex gap-2">
                            {isEditing ? (
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
                                        disabled={!coverLetterSnapshot}
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
                                        disabled={isDownloading || !coverLetterSnapshot}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-7 px-2 text-xs gap-1 disabled:opacity-50"
                                    >
                                        {isDownloading ? 'Saving...' : <><Download size={12} /> Download PDF</>}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Paper Preview */}
                <div className="flex justify-center bg-gray-100/50 p-4 rounded-lg overflow-y-auto overflow-x-hidden max-h-[800px]">
                    <div className="bg-white border text-sm border-zinc-200 shadow-md transform scale-[0.55] sm:scale-[0.7] lg:scale-[0.6] xl:scale-[0.75] 2xl:scale-[0.85] origin-top text-zinc-900 font-serif relative transition-transform duration-200" style={{ width: '210mm', minHeight: '297mm' }}>
                        <div id="cover-letter-preview-content" className="bg-white p-12 leading-relaxed h-full">

                            {isEditing ? (
                                <textarea
                                    className="w-full h-[800px] resize-none font-serif text-base focus:outline-none p-2 border border-blue-200 rounded bg-blue-50/10 text-zinc-700"
                                    value={tempText}
                                    onChange={(e) => setTempText(e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                coverLetterSnapshot ? (
                                    <div className="prose prose-zinc max-w-none text-zinc-800 break-words whitespace-pre-line">
                                        <ReactMarkdown>
                                            {coverLetterSnapshot}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[600px] text-zinc-400 space-y-4 font-sans">
                                        <Wand2 size={48} className="opacity-20" />
                                        <p className="text-sm text-center max-w-[200px]">
                                            Generate a cover letter tailored to this job.
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
