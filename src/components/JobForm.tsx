import { useState, useEffect } from 'react';
import { type Job } from '@/types/job';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/client';
import { X } from 'lucide-react';
import { generateResumeDraft, refineResume, extractKeywords, calculateATSScore, type ATSAnalysis } from '@/ai/openrouter';
// @ts-ignore
import html2pdf from 'html2pdf.js';

import { ATSScoreGauge } from './job-form/ATSScoreGauge';
import { JobDetailsForm } from './job-form/JobDetailsForm';
import { KeywordManager } from './job-form/KeywordManager';
import { ResumeGenerator } from './job-form/ResumeGenerator';
import { ResumePreview } from './job-form/ResumePreview';

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

    const [hasCopied, setHasCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditingResume, setIsEditingResume] = useState(false);
    const [tempResumeText, setTempResumeText] = useState('');
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
                if (initialData.profileId) setSelectedProfileId(initialData.profileId);
            } else {
                // New Job Mode - Clean Slate
                setFormData({ ...EMPTY_JOB, dateApplied: new Date(), createdAt: new Date(), updatedAt: new Date() });
                if (profiles.length > 0) setSelectedProfileId(profiles[0].id!);

                // Reset UI states
                setKeywords([]);
                setManualKeyword('');
                setAtsAnalysis(null);
                setActiveTab('draft');
                setRefineInstructions('');
                setTempResumeText('');
                setIsEditingResume(false);
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
            }, keywords);

            setFormData(prev => ({ ...prev, resumeSnapshot: generatedResume, profileId: Number(selectedProfileId) }));
            setActiveTab('refine');

            // Trigger ATS Score Calculation
            handleCalculateScore(generatedResume);

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
            // Recalculate Score
            handleCalculateScore(refined);
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

    const handleDownloadPDF = async () => {
        const element = document.getElementById('resume-preview-content');
        if (!element) return;

        setIsDownloading(true);

        let filename = 'resume.pdf';
        if (selectedProfileId) {
            const profile = profiles.find(p => p.id === Number(selectedProfileId));
            if (profile) {
                // Determine filename: <profile_full_name>_resume.pdf
                const safeName = profile.name.trim().replace(/\s+/g, '_');
                filename = `${safeName}_resume.pdf`;
            }
        } else {
            filename = `${formData.company || 'Resume'}_${formData.role || 'Job'}_resume.pdf`;
        }

        // Options for html2pdf
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

    const handleEnterEditMode = () => {
        setTempResumeText(formData.resumeSnapshot || '');
        setIsEditingResume(true);
    };

    const handleSaveEdit = () => {
        setFormData(prev => ({ ...prev, resumeSnapshot: tempResumeText }));
        setIsEditingResume(false);
        // Recalculate Score
        handleCalculateScore(tempResumeText);
    };

    const handleCancelEdit = () => {
        setTempResumeText('');
        setIsEditingResume(false);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 backdrop-blur-sm p-4 sm:p-6 fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative w-full max-w-7xl bg-white rounded-xl shadow-2xl border border-zinc-200 flex flex-col h-[90vh] max-h-[900px] overflow-hidden">

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
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 overflow-hidden">

                    {/* LEFT: Job Details */}
                    <div className="p-6 overflow-y-auto space-y-6 bg-white">
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

                    {/* RIGHT: AI Resume */}
                    <div className="bg-zinc-50/50 flex flex-col h-full overflow-hidden">
                        <ResumeGenerator
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            profiles={profiles}
                            selectedProfileId={selectedProfileId}
                            setSelectedProfileId={setSelectedProfileId}
                            isGenerating={isGenerating}
                            onGenerate={handleGenerate}
                            onRefine={handleRefine}
                            refineInstructions={refineInstructions}
                            setRefineInstructions={setRefineInstructions}
                        />

                        <ResumePreview
                            isEditingResume={isEditingResume}
                            tempResumeText={tempResumeText}
                            setTempResumeText={setTempResumeText}
                            resumeSnapshot={formData.resumeSnapshot || ''}
                            handleCancelEdit={handleCancelEdit}
                            handleSaveEdit={handleSaveEdit}
                            handleEnterEditMode={handleEnterEditMode}
                            handleCopyText={handleCopyText}
                            handleDownloadPDF={handleDownloadPDF}
                            hasCopied={hasCopied}
                            isDownloading={isDownloading}
                            selectedProfileId={selectedProfileId}
                            profiles={profiles}
                        />
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

