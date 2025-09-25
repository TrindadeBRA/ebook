import React from 'react';

export type ReadingMode = 'paginated' | 'scrolled';

type Props = {
	mode: ReadingMode;
	onChange: (mode: ReadingMode) => void;
};

const ReadingModeToggle: React.FC<Props> = ({ mode, onChange }) => {
	const isPaginated = mode === 'paginated';
	const baseBtn =
		'px-3 py-1.5 rounded-md border text-xs leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
	const activeClasses =
		`${baseBtn} bg-blue-600 border-blue-600 text-white shadow-inner focus:ring-blue-400`;
	const inactiveClasses =
		`${baseBtn} bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100 focus:ring-slate-300`;

	return (
		<div className="inline-flex items-center gap-2">
			<span className="">Modo:</span>
			<div
				role="group"
				aria-label="Alternar modo de leitura"
				className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-200 p-1"
			>
				<button
					aria-pressed={isPaginated}
					onClick={() => onChange('paginated')}
					className={isPaginated ? activeClasses : inactiveClasses}
				>
					Paginado
				</button>
				<button
					aria-pressed={!isPaginated}
					onClick={() => onChange('scrolled')}
					className={!isPaginated ? activeClasses : inactiveClasses}
				>
					Scroll
				</button>
			</div>
		</div>
	);
};

export default ReadingModeToggle;


