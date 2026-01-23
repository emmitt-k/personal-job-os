import { RefreshCw } from 'lucide-react';
import { type ATSAnalysis } from '@/ai/openrouter';

interface ATSScoreGaugeProps {
    atsAnalysis: ATSAnalysis | null;
    isCalculatingScore: boolean;
    onRecalculate: () => void;
    hasResume: boolean;
}

export function ATSScoreGauge({ atsAnalysis, isCalculatingScore, onRecalculate, hasResume }: ATSScoreGaugeProps) {
    return (
        <div className="flex items-center gap-3 pr-4 border-r border-zinc-100">
            <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">ATS Score</span>
                <span className={`text-xs font-bold ${isCalculatingScore ? 'text-zinc-400' :
                    !atsAnalysis ? 'text-zinc-300' :
                        atsAnalysis.score >= 75 ? 'text-emerald-600' :
                            atsAnalysis.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                    {isCalculatingScore ? 'Calculating...' :
                        !atsAnalysis ? 'N/A' :
                            atsAnalysis.score >= 75 ? 'High Match' :
                                atsAnalysis.score >= 50 ? 'Medium Match' : 'Low Match'}
                </span>
                {atsAnalysis && (
                    <span className={`text-[9px] max-w-[100px] truncate ${atsAnalysis.score === 0 ? 'text-red-500 font-bold' : 'text-zinc-400'}`} title={atsAnalysis.feedback}>
                        {atsAnalysis.feedback}
                    </span>
                )}
            </div>
            <div className="flex flex-col items-center justify-center w-14">
                <span className="text-[11px] font-black text-zinc-900 mb-[-2px]">
                    {isCalculatingScore ? '...' : (atsAnalysis?.score || 0)}%
                </span>
                <div className="w-14 h-8">
                    <svg viewBox="0 0 100 55" className="w-full h-full">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f4f4f5" strokeWidth="12" strokeLinecap="round" />
                        {/* Dynamic Colored Segment */}
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke={
                                !atsAnalysis ? '#f4f4f5' :
                                    atsAnalysis.score >= 75 ? '#22c55e' :
                                        atsAnalysis.score >= 50 ? '#eab308' : '#ef4444'
                            }
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="126" // approx length of semi-circle arc
                            strokeDashoffset={126 - (126 * ((atsAnalysis?.score || 0) / 100))}
                            className="transition-all duration-1000 ease-out"
                        />

                        {/* Needle */}
                        <g className="transition-transform duration-1000 ease-out origin-[50px_50px]" style={{ transform: `rotate(${((atsAnalysis?.score || 0) / 100 * 180) - 90}deg)` }}>
                            <line x1="50" y1="50" x2="50" y2="15" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
                        </g>
                        <circle cx="50" cy="50" r="4" fill="#18181b" />
                    </svg>
                </div>
            </div>
            {/* Recalculate Button */}
            <button
                onClick={onRecalculate}
                disabled={isCalculatingScore || !hasResume}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-50"
                title="Recalculate ATS Score"
            >
                <RefreshCw size={14} className={isCalculatingScore ? "animate-spin" : ""} />
            </button>
        </div>
    );
}
