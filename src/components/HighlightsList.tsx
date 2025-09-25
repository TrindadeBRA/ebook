import React from 'react';

export type HighlightItem = {
	id: string;
	text: string;
	cfiRange: string;
	color: string;
};

type Props = {
	items: HighlightItem[];
	onShow: (cfiRange: string) => void;
	onRemove: (id: string, cfiRange: string) => void;
};

const HighlightsList: React.FC<Props> = ({ items, onShow, onRemove }) => {
	return (
		<div className="border border-stone-400 bg-white min-h-[100px] p-2 rounded">
			<h2 className="font-bold mb-1">Destaques</h2>
			{items.length === 0 ? (
				<p className="text-sm text-slate-600">Nenhum destaque ainda.</p>
			) : (
				<ul className="grid grid-cols-1 divide-y divide-stone-300 border-t border-stone-300 -mx-2">
					{items.map(({ id, text, cfiRange, color }) => (
						<li key={id} className="p-2 flex items-start gap-2">
							<span className="mt-1 size-3 rounded-full border" style={{ backgroundColor: color }} />
							<div className="flex-1">
								<p className="text-sm">{text}</p>
								<div className="mt-1 space-x-2">
									<button className="underline hover:no-underline text-xs" onClick={() => onShow(cfiRange)}>Visualizar</button>
									<button className="underline hover:no-underline text-xs text-rose-600" onClick={() => onRemove(id, cfiRange)}>Remover</button>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default HighlightsList;


