import { Wand2, Copy, Download, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { type Profile } from '@/types/profile';

interface ResumePreviewProps {
    isEditingResume: boolean;
    tempResumeText: string;
    setTempResumeText: (text: string) => void;
    resumeSnapshot: string;
    handleCancelEdit: () => void;
    handleSaveEdit: () => void;
    handleEnterEditMode: () => void;
    handleCopyText: () => void;
    handleDownloadPDF: () => void;
    hasCopied: boolean;
    isDownloading: boolean;
    selectedProfileId: number | '';
    profiles: Profile[];
}

export function ResumePreview({
    isEditingResume,
    tempResumeText,
    setTempResumeText,
    resumeSnapshot,
    handleCancelEdit,
    handleSaveEdit,
    handleEnterEditMode,
    handleCopyText,
    handleDownloadPDF,
    hasCopied,
    isDownloading,
    selectedProfileId,
    profiles
}: ResumePreviewProps) {
    return (
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

            {/* Resume Preview Paper */}
            <div className="space-y-6 flex justify-center bg-gray-100/50 p-4 rounded-lg overflow-y-auto max-h-[800px]">
                <div className="bg-white border text-sm border-zinc-200 shadow-md transform scale-100 origin-top text-zinc-900 font-sans relative" style={{ width: '210mm', minHeight: '297mm' }}>
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
                                                const text = String(children).toUpperCase();
                                                const isProjects = text.includes('PROJECTS');
                                                return (
                                                    <h2
                                                        className={`font-bold border-b border-zinc-900 mb-3 pb-2 uppercase tracking-wider text-base font-sans text-left w-full block ${isProjects ? 'mt-48' : 'mt-6'}`}
                                                    >
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
                                            hr: () => <hr className="my-4 border-zinc-200" />,
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
    );
}
