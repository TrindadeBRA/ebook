import React from 'react';

type Props = {
	value: string;
	onChange: (color: string) => void;
	colors?: string[];
};

const DEFAULT_COLORS = ['#ef4444', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const HighlightColorSelector: React.FC<Props> = ({ value, onChange, colors = DEFAULT_COLORS }) => {
	return (
		<div className="flex items-center gap-2 flex-wrap">
			{colors.map((c) => (
				<button
					key={c}
					onClick={() => onChange(c)}
					className="size-8 rounded-full border-2 border-transparent aria-[current]:border-black"
					style={{ backgroundColor: c }}
					aria-current={c === value ? 'true' : undefined}
					aria-label={`Selecionar cor ${c}`}
				/>
			))}
		</div>
	);
};

export default HighlightColorSelector;


