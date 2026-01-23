import { RefreshCw, Wand2, X, Plus } from 'lucide-react';

interface KeywordManagerProps {
    keywords: string[];
    isExtracting: boolean;
    hasDescription: boolean;
    manualKeyword: string;
    onExtract: () => void;
    onAdd: () => void;
    onRemove: (keyword: string) => void;
    setManualKeyword: (keyword: string) => void;
}

export function KeywordManager({
    keywords,
    isExtracting,
    hasDescription,
    manualKeyword,
    onExtract,
    onAdd,
    onRemove,
    setManualKeyword
}: KeywordManagerProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Keywords Analyzer</h3>
                <button
                    type="button"
                    onClick={onExtract}
                    disabled={isExtracting || !hasDescription}
                    className="inline-flex items-center justify-center rounded-md text-[10px] font-medium transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 h-6 px-2 gap-1 text-zinc-600 disabled:opacity-50"
                >
                    {isExtracting ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    Extract Keywords
                </button>
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-md border border-dashed border-zinc-200 bg-zinc-50/50 min-h-[60px]">
                {keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {keywords.map(kw => (
                            <span key={kw} className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium border-transparent bg-blue-100 text-blue-700 gap-1 animate-in fade-in zoom-in duration-200">
                                {kw}
                                <button
                                    type="button"
                                    onClick={() => onRemove(kw)}
                                    className="ml-0.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                >
                                    <X size={8} strokeWidth={3} />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-zinc-400 italic text-center py-2">
                        Paste job description to extract keywords or add manually.
                    </p>
                )}

                {/* Manual Add Input */}
                <div className="flex items-center gap-2 mt-1 border-t border-zinc-200/50 pt-2">
                    <input
                        type="text"
                        className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-zinc-400"
                        placeholder="Add keyword..."
                        value={manualKeyword}
                        onChange={e => setManualKeyword(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onAdd();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={onAdd}
                        disabled={!manualKeyword.trim()}
                        className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
