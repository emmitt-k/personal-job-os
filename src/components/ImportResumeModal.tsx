import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalyze: (text: string) => Promise<void>;
}

export function ImportResumeModal({ isOpen, onClose, onAnalyze }: ImportResumeModalProps) {
    const [text, setText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    if (!isOpen) return null;

    const handleAnalyze = async () => {
        if (!text.trim()) return;

        setIsAnalyzing(true);
        try {
            await onAnalyze(text);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh] transition-all">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Import from Resume</h2>
                        <p className="text-sm text-muted-foreground">Paste your resume text below to auto-generate a profile.</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <textarea
                        className="flex min-h-[300px] w-full rounded-md border border-input bg-muted/30 px-4 py-3 text-sm shadow-sm resize-y focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                        placeholder="Paste your full resume text here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isAnalyzing}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/30 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md"
                        disabled={isAnalyzing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={!text.trim() || isAnalyzing}
                        className={cn(
                            "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 shadow gap-2",
                            "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span> Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Analyze with AI
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
