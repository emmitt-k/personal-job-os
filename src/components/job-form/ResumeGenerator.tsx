import { RefreshCw, Wand2 } from 'lucide-react';
import { type Profile } from '@/types/profile';

interface ResumeGeneratorProps {
    activeTab: 'draft' | 'refine';
    setActiveTab: (tab: 'draft' | 'refine') => void;
    profiles: Profile[];
    selectedProfileId: number | '';
    setSelectedProfileId: (id: number) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    onRefine: () => void;
    refineInstructions: string;
    setRefineInstructions: (instructions: string) => void;
}

export function ResumeGenerator({
    activeTab,
    setActiveTab,
    profiles,
    selectedProfileId,
    setSelectedProfileId,
    isGenerating,
    onGenerate,
    onRefine,
    refineInstructions,
    setRefineInstructions
}: ResumeGeneratorProps) {
    return (
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
                        onClick={onGenerate}
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
                                onClick={onRefine}
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
    );
}
