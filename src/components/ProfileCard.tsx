import { type Profile } from '@/types/profile';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ProfileCardProps {
    profile: Profile;
    onEdit: (profile: Profile) => void;
}

export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
    // Generate initials for the avatar
    const initials = profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Color mapping for avatar based on first letter (simple hash)
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    ];
    const colorIndex = (profile.name.charCodeAt(0) || 0) % colors.length;
    const avatarClass = colors[colorIndex];

    return (
        <div
            onClick={() => onEdit(profile)}
            className="rounded-lg border border-border bg-card shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-semibold text-lg", avatarClass)}>
                    {initials}
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <h3 className="text-base font-semibold text-foreground mb-1">{profile.name}</h3>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                {profile.intro || `Targeting ${profile.targetRole}...`}
            </p>

            <div className="flex flex-wrap gap-2 mb-4 h-14 overflow-hidden content-start">
                {profile.skills.slice(0, 4).map((skill, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-transparent bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/80"
                    >
                        {skill}
                    </span>
                ))}
                {profile.skills.length > 4 && (
                    <span className="inline-flex items-center rounded-full border border-transparent bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        +{profile.skills.length - 4}
                    </span>
                )}
            </div>

            <div className="text-xs text-muted-foreground">
                Last updated: {formatDistanceToNow(profile.updatedAt, { addSuffix: true })}
            </div>
        </div>
    );
}
