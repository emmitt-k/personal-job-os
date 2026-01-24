import { useState, useEffect } from 'react';
import { type Job } from '@/types/job';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/client';
import { X } from 'lucide-react';
import { extractKeywords, calculateATSScore, type ATSAnalysis } from '@/ai/analysis';
// @ts-ignore
import html2pdf from 'html2pdf.js';

import { ATSScoreGauge } from './job-form/ATSScoreGauge';
import { JobDetailsForm } from './job-form/JobDetailsForm';
import { KeywordManager } from './job-form/KeywordManager';
import { ResumeBuilder } from './job-form/ResumeBuilder';
import { CoverLetterBuilder } from './job-form/CoverLetterBuilder';

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
    const [documentTab, setDocumentTab] = useState<'resume' | 'cover-letter'>('resume');

    // Keywords State (Needed for Resume Generation)
    const [keywords, setKeywords] = useState<string[]>([]);
    const [manualKeyword, setManualKeyword] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);

    // ATS Score State
    const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
    const [isCalculatingScore, setIsCalculatingScore] = useState(false);

    // Load Draft on Mount
    // Reset / Initialize Form State
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit Mode
                setFormData({ ...initialData });
            } else {
                // New Job Mode - Clean Slate
                setFormData({ ...EMPTY_JOB, dateApplied: new Date(), createdAt: new Date(), updatedAt: new Date() });

                // Reset UI states
                setKeywords([]);
                setManualKeyword('');
                setAtsAnalysis(null);
                setDocumentTab('resume');
            }
        }
    }, [isOpen, initialData, profiles]);

    if (!isOpen) return null;

    const handleCalculateScore = async (resumeText: string) => {
        if (!resumeText || !formData.description) return;
        setIsCalculatingScore(true);
        try {
            const analysis = await calculateATSScore(resumeText, formData.description);
            setAtsAnalysis(analysis);
        } catch (error) {
            console.error("Score calc failed", error);
        } finally {
            setIsCalculatingScore(false);
        }
    };

    const handleUpdateResume = (text: string, profileId?: number) => {
        setFormData(prev => ({
            ...prev,
            resumeSnapshot: text,
            ...(profileId ? { profileId } : {})
        }));
        // Trigger ATS Score Calculation
        handleCalculateScore(text);
    };

    const handleUpdateCoverLetter = (text: string) => {
        setFormData(prev => ({
            ...prev,
            coverLetterSnapshot: text
        }));
    };

    const handleSave = async () => {
        if (!formData.company || !formData.role) {
            alert("Company and Role are required.");
            return;
        }
        await onSave(formData);
    };




    const handleExtractKeywords = async () => {
        if (!formData.description) return;
        setIsExtracting(true);
        try {
            const extracted = await extractKeywords(formData.description);
            // Merge with existing unique keywords
            setKeywords(prev => Array.from(new Set([...prev, ...extracted])));
        } catch (error) {
            console.error("Extraction failed", error);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleAddKeyword = () => {
        if (!manualKeyword.trim()) return;
        if (!keywords.includes(manualKeyword.trim())) {
            setKeywords([...keywords, manualKeyword.trim()]);
        }
        setManualKeyword('');
    };

    const handleRemoveKeyword = (keyword: string) => {
        setKeywords(keywords.filter(k => k !== keyword));
    };

    const handleDescriptionPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pastedText = e.clipboardData.getData('text');
        // Auto-trigger extraction if keywords are empty and text is substantial
        if (keywords.length === 0 && pastedText.length > 50) {
            setIsExtracting(true);
            extractKeywords(pastedText).then(extracted => {
                setKeywords(prev => Array.from(new Set([...prev, ...extracted])));
            }).finally(() => setIsExtracting(false));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 backdrop-blur-sm p-0 fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative w-full h-full bg-white shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-zinc-900">
                            {initialData ? 'Edit Job' : 'Add New Job'}
                        </h2>
                        <p className="text-sm text-zinc-500">Track a new job and generate a tailored resume.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <ATSScoreGauge
                            atsAnalysis={atsAnalysis}
                            isCalculatingScore={isCalculatingScore}
                            onRecalculate={() => handleCalculateScore(formData.resumeSnapshot || '')}
                            hasResume={!!formData.resumeSnapshot}
                        />

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-100 hover:text-zinc-900 h-8 w-8 p-0 text-zinc-500"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body (2 Columns) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 overflow-hidden">

                    {/* LEFT: Job Details */}
                    <div className="p-6 overflow-y-auto space-y-6 bg-white lg:col-span-5">
                        <JobDetailsForm
                            formData={formData}
                            setFormData={setFormData}
                            handleDescriptionPaste={handleDescriptionPaste}
                        />

                        <KeywordManager
                            keywords={keywords}
                            isExtracting={isExtracting}
                            hasDescription={!!formData.description}
                            manualKeyword={manualKeyword}
                            onExtract={handleExtractKeywords}
                            onAdd={handleAddKeyword}
                            onRemove={handleRemoveKeyword}
                            setManualKeyword={setManualKeyword}
                        />
                    </div>

                    {/* RIGHT: Document Builder (Resume / Cover Letter) */}
                    <div className="bg-zinc-50/50 flex flex-col h-full overflow-hidden lg:col-span-7">

                        {/* Tab Bar */}
                        <div className="flex items-center px-4 pt-4 gap-2 border-b border-zinc-200">
                            <button
                                onClick={() => setDocumentTab('resume')}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative top-[1px] ${documentTab === 'resume'
                                    ? 'bg-zinc-50/50 text-zinc-900 border border-zinc-200 border-b-transparent'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                    }`}
                            >
                                Create Resume
                            </button>
                            <button
                                onClick={() => setDocumentTab('cover-letter')}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative top-[1px] ${documentTab === 'cover-letter'
                                    ? 'bg-zinc-50/50 text-zinc-900 border border-zinc-200 border-b-transparent'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                    }`}
                            >
                                Create Cover Letter
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden">
                            {documentTab === 'resume' && (
                                <ResumeBuilder
                                    profiles={profiles}
                                    jobDetails={{
                                        company: formData.company || '',
                                        role: formData.role || '',
                                        description: formData.description || ''
                                    }}
                                    keywords={keywords}
                                    resumeSnapshot={formData.resumeSnapshot || ''}
                                    onUpdateResume={handleUpdateResume}
                                    initialProfileId={formData.profileId || (profiles.length > 0 ? profiles[0].id : undefined)}
                                />
                            )}
                            {documentTab === 'cover-letter' && (
                                <CoverLetterBuilder
                                    profiles={profiles}
                                    jobDetails={{
                                        company: formData.company || '',
                                        role: formData.role || '',
                                        description: formData.description || ''
                                    }}
                                    coverLetterSnapshot={formData.coverLetterSnapshot || ''}
                                    onUpdateCoverLetter={handleUpdateCoverLetter}
                                    initialProfileId={formData.profileId || (profiles.length > 0 ? profiles[0].id : undefined)}
                                />
                            )}
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
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-9 px-4 py-2 shadow"
                    >
                        Save Application
                    </button>
                </div>
            </div>
        </div>
    );
}

