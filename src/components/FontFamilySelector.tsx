import React from 'react';

export type FontFamilyOption = {
	value: string;
	label: string;
};

type Props = {
	value: string;
	onChange: (value: string) => void;
	options?: FontFamilyOption[];
};

const DEFAULT_OPTIONS: FontFamilyOption[] = [
	{ value: 'inherit', label: 'Padrão do livro' },
	{ value: 'Georgia, serif', label: 'Serif (Georgia)' },
	{ value: 'Arial, Helvetica, sans-serif', label: 'Sans-serif (Arial)' },
	{ value: 'Courier New, monospace', label: 'Monospace (Courier New)' },
];

const FontFamilySelector: React.FC<Props> = ({ value, onChange, options = DEFAULT_OPTIONS }) => {
	return (
		<label style={{ display: 'inline-block' }}>
			<span style={{ marginRight: 8 }}>Fonte:</span>
			<select value={value} onChange={(e) => onChange(e.target.value)}>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</label>
	);
};

export default FontFamilySelector;


