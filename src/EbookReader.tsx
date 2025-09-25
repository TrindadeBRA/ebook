import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ReactReader } from 'react-reader';
import FontFamilySelector from './components/FontFamilySelector';
import FontSizeSelector from './components/FontSizeSelector';
import ReadingModeToggle, { ReadingMode } from './components/ReadingModeToggle';
import ThemeToggle, { ThemeMode } from './components/ThemeToggle';
import HighlightColorSelector from './components/HighlightColorSelector';
import HighlightsList, { type HighlightItem } from './components/HighlightsList';

const EbookReader: React.FC = () => {
	const [location, setLocation] = useState<string | number>(0);
	const [fontFamily, setFontFamily] = useState<string>('inherit');
	const [fontSize, setFontSize] = useState<string>('16px');
	const [readingMode, setReadingMode] = useState<ReadingMode>('paginated');
	const [themeMode, setThemeMode] = useState<ThemeMode>('light');
	const renditionRef = useRef<any | null>(null);
const [highlightColor, setHighlightColor] = useState<string>('#ef4444');
const [highlights, setHighlights] = useState<HighlightItem[]>([]);
const [showHighlights, setShowHighlights] = useState<boolean>(false);

	const handleLocationChanged = useCallback((epubcfi: string) => {
		setLocation(epubcfi);
	}, []);

	const readerHeader = useMemo(() => (
		<div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 12px' }}>
			<ReadingModeToggle mode={readingMode} onChange={setReadingMode} />
			<ThemeToggle value={themeMode} onChange={setThemeMode} />
			<FontFamilySelector value={fontFamily} onChange={setFontFamily} />
			<FontSizeSelector value={fontSize} onChange={setFontSize} />
			<div className="inline-flex items-center gap-2">
				<span className="text-slate-600 text-xs">Destaque:</span>
				<HighlightColorSelector value={highlightColor} onChange={setHighlightColor} />
				<button
					className="px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100"
					onClick={() => setShowHighlights((v) => !v)}
				>
					Destaques ({highlights.length})
				</button>
			</div>
		</div>
	), [readingMode, themeMode, fontFamily, fontSize, highlightColor, highlights.length]);

	const applyTheme = useCallback(() => {
		if (!renditionRef.current) return;
		// Registra regras no body do iframe do EPUB e força seleção do tema
		renditionRef.current.themes.register('custom', {
			body: {
				'font-family': `${fontFamily} !important`,
				'font-size': fontSize,
				'color': themeMode === 'dark' ? '#ffffff' : '#000000',
				'background': themeMode === 'dark' ? '#000000' : '#ffffff',
			},
		});
		renditionRef.current.themes.select('custom');
		// Refina com APIs dedicadas (alguns livros têm CSS agressivo)
		renditionRef.current.themes.override('font-family', `${fontFamily} !important`);
		renditionRef.current.themes.fontSize(fontSize);
		// Ajusta tema por override explícito
		renditionRef.current.themes.override('color', themeMode === 'dark' ? '#ffffff' : '#000000');
		renditionRef.current.themes.override('background', themeMode === 'dark' ? '#000000' : '#ffffff');
	}, [fontFamily, fontSize, themeMode]);

	const handleGetRendition = useCallback((rendition: any) => {
		renditionRef.current = rendition;
		applyTheme();
		// Aplica comportamento suave de scroll quando em modo "scrolled"
		try {
			if (readingMode === 'scrolled' && renditionRef.current?.manager?.container?.style) {
				renditionRef.current.manager.container.style['scroll-behavior'] = 'smooth';
			}
		} catch {}

		// Registrar seleção para destaques
		const onSelected = (cfiRange: string, contents: any) => {
			try {
				const range = renditionRef.current?.getRange?.(cfiRange);
				const selectedText = range ? String(range.toString()) : '';
				const id = `${cfiRange}-${Date.now()}`;
				// Visual no EPUB
				renditionRef.current?.annotations?.remove?.(cfiRange, 'highlight');
				renditionRef.current?.annotations?.add?.(
					'highlight',
					cfiRange,
					{},
					() => {},
					'epubjs-hl',
					{ fill: highlightColor, 'fill-opacity': 0.35 }
				);
				setHighlights((prev) => prev.concat([{ id, text: selectedText, cfiRange, color: highlightColor }]));
				const sel = contents?.window?.getSelection?.();
				sel?.removeAllRanges();
			} catch {}
		};

		renditionRef.current?.on?.('selected', onSelected);
		return () => {
			try { renditionRef.current?.off?.('selected', onSelected); } catch {}
		};
	}, [applyTheme, readingMode, highlightColor]);

	React.useEffect(() => {
		applyTheme();
	}, [applyTheme]);

	// Reaplica destaques quando muda modo/rendition
	const reapplyHighlights = useCallback(() => {
		if (!renditionRef.current) return;
		try {
			for (const h of highlights) {
				renditionRef.current.annotations?.remove?.(h.cfiRange, 'highlight');
				renditionRef.current.annotations?.add?.('highlight', h.cfiRange, {}, () => {}, 'epubjs-hl', { fill: h.color, 'fill-opacity': 0.35 });
			}
		} catch {}
	}, [highlights]);

	React.useEffect(() => {
		reapplyHighlights();
	}, [reapplyHighlights, readingMode]);

	const epubOptions = useMemo(() => {
		if (readingMode === 'scrolled') {
			return {
				flow: 'scrolled',
				manager: 'continuous',
				spread: 'none',
				allowPopups: false,
				allowScriptedContent: false,
			} as const;
		}
		return {
			flow: 'paginated',
			manager: 'default',
			spread: 'none',
			allowPopups: false,
			allowScriptedContent: false,
		} as const;
	}, [readingMode]);

	// Atualiza estilo do container quando o modo muda, sem depender de remount dos hooks
	React.useEffect(() => {
		try {
			if (!renditionRef.current?.manager?.container?.style) return;
			if (readingMode === 'scrolled') {
				renditionRef.current.manager.container.style['scroll-behavior'] = 'smooth';
			} else {
				// Remove custom scroll-behavior em modo paginado
				renditionRef.current.manager.container.style.removeProperty('scroll-behavior');
			}
		} catch {}
	}, [readingMode]);

	return (
		<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
			{readerHeader}
			{showHighlights && (
				<div className="px-3 pb-2">
					<HighlightsList
						items={highlights}
						onShow={(cfi) => renditionRef.current?.display?.(cfi)}
						onRemove={(id, cfi) => {
							try { renditionRef.current?.annotations?.remove?.(cfi, 'highlight'); } catch {}
							setHighlights((prev) => prev.filter((h) => h.id !== id));
						}}
					/>
				</div>
			)}
			<div style={{ flex: 1 }}>
				<ReactReader
					key={`reader-${readingMode}`}
					title="Demo EPUB"
					url="/asset/alice.epub"
					location={location}
					locationChanged={handleLocationChanged}
					getRendition={handleGetRendition}
					epubOptions={epubOptions as any}
				/>
			</div>
		</div>
	);
};

export default EbookReader;


