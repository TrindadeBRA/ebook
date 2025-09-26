import React from 'react';

export type ThemeMode = 'light' | 'dark' | 'yellow';

type Props = {
	value: ThemeMode;
	onChange: (next: ThemeMode) => void;
};

const ThemeToggle: React.FC<Props> = ({ value, onChange }) => {
    const isDark = value === 'dark';
    const isYellow = value === 'yellow';
	const baseBtn =
		'px-3 py-1.5 rounded-md border text-xs leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
	const active = `${baseBtn} bg-slate-900 border-slate-900 text-white shadow-inner focus:ring-slate-500`;
	const inactive = `${baseBtn} bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100 focus:ring-slate-300`;

	return (
		<div className="inline-flex items-center gap-2">
			<span className="text-slate-600 text-xs">Tema:</span>
            <div
				role="group"
				aria-label="Alternar tema do leitor"
				className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-200 p-1"
			>
				<button
					aria-pressed={!isDark}
					onClick={() => onChange('light')}
                    className={value === 'light' ? active : inactive}
				>
					Claro
				</button>
				<button
                    aria-pressed={isDark}
					onClick={() => onChange('dark')}
					className={isDark ? active : inactive}
				>
					Escuro
				</button>
                <button
                    aria-pressed={isYellow}
                    onClick={() => onChange('yellow')}
                    className={isYellow ? `${active} bg-amber-400 border-amber-500 text-slate-900` : inactive}
                >
                    Amarelo
                </button>
			</div>
		</div>
	);
};

export default ThemeToggle;


