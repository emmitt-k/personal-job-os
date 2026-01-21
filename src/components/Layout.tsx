import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const location = useLocation();

    const navItems = [
        { href: '/', label: 'Job Tracker', icon: LayoutDashboard },
        { href: '/profiles', label: 'Profiles', icon: Users },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="h-screen bg-background flex overflow-hidden font-sans text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-muted/40 flex flex-col flex-shrink-0">
                <div className="h-14 flex items-center px-4 border-b border-border bg-background">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                        <img src="/favicon.png" alt="Job OS Logo" className="w-5 h-5 object-contain" />
                        Job OS
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon size={16} strokeWidth={2} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs p-3 rounded-md border border-blue-100 dark:border-blue-900/50">
                        <p className="font-medium mb-1">Local Mode</p>
                        <p className="opacity-80">Data stored in IndexedDB.</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background">
                {children}
            </main>
        </div>
    );
}
