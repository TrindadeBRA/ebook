import React from 'react';

export type FontSizeOption = {
	value: string;
	label: string;
};

type Props = {
	value: string;
	onChange: (value: string) => void;
	options?: FontSizeOption[];
};

const DEFAULT_OPTIONS: FontSizeOption[] = [
	{ value: '12px', label: '12' },
	{ value: '14px', label: '14' },
	{ value: '16px', label: '16' },
	{ value: '18px', label: '18' },
	{ value: '20px', label: '20' },
	{ value: '22px', label: '22' },
	{ value: '24px', label: '24' },
	{ value: '28px', label: '28' },
];

const FontSizeSelector: React.FC<Props> = ({ value, onChange, options = DEFAULT_OPTIONS }) => {
	return (
		<label style={{ display: 'inline-block' }}>
			<span style={{ marginRight: 8 }}>Tamanho:</span>
			<select value={value} onChange={(e) => onChange(e.target.value)}>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}px
					</option>
				))}
			</select>
		</label>
	);
};

export default FontSizeSelector;


