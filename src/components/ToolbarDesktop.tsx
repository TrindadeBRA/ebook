import React from 'react';

type Props = {
    left?: React.ReactNode;
    center?: React.ReactNode;
    right?: React.ReactNode;
    className?: string;
};

const ToolbarDesktop: React.FC<Props> = ({ left, center, right, className = '' }) => {
    return (
        <div className="hidden sm:block w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto px-3">
                <div className={`flex items-center gap-2 py-2 ${className}`}>
                    <div className="flex items-center gap-2">
                        {left}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        {center}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        {right}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolbarDesktop;


