import React from 'react';

type ToolbarSection = {
    children: React.ReactNode;
};

type Props = {
    left?: React.ReactNode;
    center?: React.ReactNode;
    right?: React.ReactNode;
    className?: string;
};

const ToolbarSection: React.FC<ToolbarSection> = ({ children }) => {
    return (
        <div className="flex items-center gap-2">
            {children}
        </div>
    );
};

const Toolbar: React.FC<Props> & { Section: typeof ToolbarSection } = ({ left, center, right, className = '' }) => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    return (
        <div className={`w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60`}>
            <div className={`mx-auto max-w-5xl px-2 sm:px-3`}>
                <div className={`flex items-center gap-2 py-2 ${className}`}>
                    <div className="hidden sm:flex items-center gap-2">
                        {left}
                    </div>
                    <div className="ml-auto sm:hidden">
                        <button
                            className="px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100"
                            onClick={() => setIsMobileOpen((v) => !v)}
                            aria-expanded={isMobileOpen ? 'true' : 'false'}
                            aria-controls="toolbar-mobile-panel"
                        >
                            Menu
                        </button>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 sm:ml-auto">
                        {center}
                    </div>
                    <div className="hidden sm:flex items-center gap-2 sm:ml-auto">
                        {right}
                    </div>
                </div>
                {isMobileOpen && (
                    <div id="toolbar-mobile-panel" className="sm:hidden border-t border-slate-200 py-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                {left}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {center}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {right}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

Toolbar.Section = ToolbarSection;

export default Toolbar;


