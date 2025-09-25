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
	const [highlightMode, setHighlightMode] = useState<boolean>(false);
	const [pendingUndo, setPendingUndo] = useState<{ id: string; cfiRange: string } | null>(null);
	const toastTimeoutRef = useRef<number | null>(null);
	const highlightModeRef = useRef<boolean>(false);
	const highlightColorRef = useRef<string>(highlightColor);

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
					className={`px-3 py-1.5 rounded-md border text-xs leading-none ${highlightMode ? 'bg-amber-200 border-amber-400' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'}`}
					onClick={() => setHighlightMode((v) => !v)}
					aria-pressed={highlightMode ? 'true' : 'false'}
					title="Ctrl+H"
				>
					{highlightMode ? 'Finalizar Destaque' : 'Ativar Destaque'}
				</button>
				<button
					className="px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100"
					onClick={() => setShowHighlights((v) => !v)}
				>
					Destaques ({highlights.length})
				</button>
			</div>
		</div>
	), [readingMode, themeMode, fontFamily, fontSize, highlightColor, highlights.length, highlightMode]);

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
		} catch { }

		// Registrar seleção para destaques
		const onSelected = (cfiRange: string, contents: any) => {
			try {
				if (!highlightModeRef.current) {
					// Fora do modo destaque, ignore a criação
					const selIgnore = contents?.window?.getSelection?.();
					selIgnore?.removeAllRanges();
					return;
				}
				const range = renditionRef.current?.getRange?.(cfiRange);
				const selectedText = range ? String(range.toString()) : '';
				const id = `${cfiRange}-${Date.now()}`;
				const color = highlightColorRef.current;
				// Visual no EPUB
				renditionRef.current?.annotations?.remove?.(cfiRange, 'highlight');
				renditionRef.current?.annotations?.add?.(
					'highlight',
					cfiRange,
					{},
					() => { },
					'epubjs-hl',
					{ fill: color, 'fill-opacity': 0.35 }
				);
				setHighlights((prev) => prev.concat([{ id, text: selectedText, cfiRange, color }]));
				setPendingUndo({ id, cfiRange });
				const sel = contents?.window?.getSelection?.();
				sel?.removeAllRanges();
			} catch { }
		};

		renditionRef.current?.on?.('selected', onSelected);
		return () => {
			try { renditionRef.current?.off?.('selected', onSelected); } catch { }
		};
	}, [applyTheme, readingMode]);

	React.useEffect(() => {
		applyTheme();
	}, [applyTheme]);

	// Reaplica destaques quando muda modo/rendition
	const reapplyHighlights = useCallback(() => {
		if (!renditionRef.current) return;
		try {
			for (const h of highlights) {
				renditionRef.current.annotations?.remove?.(h.cfiRange, 'highlight');
				renditionRef.current.annotations?.add?.('highlight', h.cfiRange, {}, () => { }, 'epubjs-hl', { fill: h.color, 'fill-opacity': 0.35 });
			}
		} catch { }
	}, [highlights]);

	React.useEffect(() => {
		reapplyHighlights();
	}, [reapplyHighlights, readingMode]);

	// Sincroniza refs para uso nos handlers
	React.useEffect(() => { highlightModeRef.current = highlightMode; }, [highlightMode]);
	React.useEffect(() => { highlightColorRef.current = highlightColor; }, [highlightColor]);

	// Atalhos de teclado: Ctrl+H alterna, Esc sai
	React.useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const isToggle = (e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H');
			if (isToggle) {
				e.preventDefault();
				setHighlightMode((v) => !v);
				return;
			}
			if (e.key === 'Escape' && highlightModeRef.current) {
				e.preventDefault();
				setHighlightMode(false);
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);

	// Toast temporário para "Desfazer"
	const handleUndoLastHighlight = useCallback(() => {
		if (!pendingUndo) return;
		try { renditionRef.current?.annotations?.remove?.(pendingUndo.cfiRange, 'highlight'); } catch { }
		setHighlights((prev) => prev.filter((h) => h.id !== pendingUndo.id));
		setPendingUndo(null);
	}, [pendingUndo]);

	React.useEffect(() => {
		if (!pendingUndo) return;
		if (toastTimeoutRef.current) {
			window.clearTimeout(toastTimeoutRef.current);
			toastTimeoutRef.current = null;
		}
		toastTimeoutRef.current = window.setTimeout(() => setPendingUndo(null), 4000);
		return () => {
			if (toastTimeoutRef.current) {
				window.clearTimeout(toastTimeoutRef.current);
				toastTimeoutRef.current = null;
			}
		};
	}, [pendingUndo]);

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
		} catch { }
	}, [readingMode]);

	return (
		<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
			{readerHeader}
			{highlightMode && (
				<div className="px-3 py-2 bg-amber-50 border-b border-amber-200 text-sm text-amber-800 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="font-medium">Modo Destaque ativo</span>
						<span className="hidden sm:inline">Selecione um trecho para criar um destaque.</span>
						<span className="inline-flex items-center gap-1 text-xs text-amber-700">
							Cor atual:
							<span className="inline-block size-3 rounded-full border" style={{ backgroundColor: highlightColor }} />
						</span>
						<span className="text-xs text-amber-700">(Esc sai • Ctrl+H alterna)</span>
					</div>
					<button className="text-xs underline hover:no-underline" onClick={() => setHighlightMode(false)}>Sair</button>
				</div>
			)}
			{showHighlights && (
				<div className="px-3 pb-2">
					<HighlightsList
						items={highlights}
						onShow={(cfi) => renditionRef.current?.display?.(cfi)}
						onRemove={(id, cfi) => {
							try { renditionRef.current?.annotations?.remove?.(cfi, 'highlight'); } catch { }
							setHighlights((prev) => prev.filter((h) => h.id !== id));
							if (pendingUndo?.id === id) setPendingUndo(null);
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
			{pendingUndo && (
				<div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-2 rounded shadow text-sm flex items-center gap-3">
					<span>Destaque criado.</span>
					<button className="underline decoration-2 underline-offset-2" onClick={handleUndoLastHighlight}>Desfazer</button>
					<button className="opacity-70 hover:opacity-100" onClick={() => setPendingUndo(null)} aria-label="Fechar">×</button>
				</div>
			)}
		</div>
	);
};

export default EbookReader;


