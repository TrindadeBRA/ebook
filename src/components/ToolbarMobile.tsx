import React from 'react';

type Props = {
    left?: React.ReactNode;
    center?: React.ReactNode;
    right?: React.ReactNode;
    className?: string;
    content?: React.ReactNode;
};

const ToolbarMobile: React.FC<Props> = ({ left, center, right, className = '', content }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="sm:hidden w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-5xl px-2">
                <div className={`flex items-center gap-2 py-2 ${className}`}>
                    <button
                        className="ml-auto px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100"
                        onClick={() => setIsOpen((v) => !v)}
                        aria-expanded={isOpen ? 'true' : 'false'}
                        aria-controls="toolbar-mobile-panel"
                    >
                        Menu
                    </button>
                </div>
                {isOpen && (
                    <div id="toolbar-mobile-panel" className="border-t border-slate-200 py-2">
                        {content ? (
                            <div className="flex flex-col gap-2">
                                {content}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col items-stretch gap-2">
                                    {left}
                                </div>
                                <div className="flex flex-col items-stretch gap-2">
                                    {center}
                                </div>
                                <div className="flex flex-col items-stretch gap-2">
                                    {right}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolbarMobile;


