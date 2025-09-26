import React from 'react';

type ThemeMode = 'light' | 'dark' | 'yellow';

type UseReaderThemeReturn = {
	fontFamily: string;
	setFontFamily: React.Dispatch<React.SetStateAction<string>>;
	fontSize: string;
	setFontSize: React.Dispatch<React.SetStateAction<string>>;
	themeMode: ThemeMode;
	setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
	bindToRendition: (rendition: any) => void;
	applyTheme: () => void;
};

export default function useReaderTheme(): UseReaderThemeReturn {
	const renditionRef = React.useRef<any | null>(null);
	const [fontFamily, setFontFamily] = React.useState<string>('inherit');
	const [fontSize, setFontSize] = React.useState<string>('16px');
	const [themeMode, setThemeMode] = React.useState<ThemeMode>('light');

	const applyTheme = React.useCallback(() => {
		if (!renditionRef.current) return;
		const isDark = themeMode === 'dark';
		const isYellow = themeMode === 'yellow';
		const textColor = isDark ? '#ffffff' : '#000000';
		const backgroundColor = isDark ? '#000000' : (isYellow ? '#FEF3C7' : '#ffffff'); // amber-100
		renditionRef.current.themes.register('custom', {
			body: {
				'font-family': `${fontFamily} !important`,
				'font-size': fontSize,
				'color': textColor,
				'background': backgroundColor,
			},
		});
		renditionRef.current.themes.select('custom');
		renditionRef.current.themes.override('font-family', `${fontFamily} !important`);
		renditionRef.current.themes.fontSize(fontSize);
		renditionRef.current.themes.override('color', textColor);
		renditionRef.current.themes.override('background', backgroundColor);
	}, [fontFamily, fontSize, themeMode]);

	const bindToRendition = React.useCallback((rendition: any) => {
		renditionRef.current = rendition;
		applyTheme();
	}, [applyTheme]);

	React.useEffect(() => { applyTheme(); }, [applyTheme]);

	return {
		fontFamily,
		setFontFamily,
		fontSize,
		setFontSize,
		themeMode,
		setThemeMode,
		bindToRendition,
		applyTheme,
	};
}


