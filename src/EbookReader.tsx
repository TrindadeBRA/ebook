import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ReactReader } from 'react-reader';
import FontFamilySelector from './components/FontFamilySelector';
import FontSizeSelector from './components/FontSizeSelector';
import ReadingModeToggle, { ReadingMode } from './components/ReadingModeToggle';
import ThemeToggle, { ThemeMode } from './components/ThemeToggle';
import HighlightColorSelector from './components/HighlightColorSelector';
import HighlightsList, { type HighlightItem } from './components/HighlightsList';
import useHighlighting from './hooks/useHighlighting';

const EbookReader: React.FC = () => {

	const [location, setLocation] = useState<string | number>(0);
	const [fontFamily, setFontFamily] = useState<string>('inherit');
	const [fontSize, setFontSize] = useState<string>('16px');
	const [readingMode, setReadingMode] = useState<ReadingMode>('paginated');
	const [themeMode, setThemeMode] = useState<ThemeMode>('light');
	const renditionRef = useRef<any | null>(null);
	const [highlightColor, setHighlightColor] = useState<string>('#ef4444');
	const [showHighlights, setShowHighlights] = useState<boolean>(false);

	const {
		highlightMode,
		setHighlightMode,
		highlights,
		pendingSelection,
		pendingUndo,
		attachToRendition,
		handleConfirmHighlight,
		handleCancelPending,
		handleUndoLastHighlight,
		removeHighlight,
		dismissUndo,
	} = useHighlighting({ highlightColor, readingMode });

	const handleLocationChanged = useCallback((epubcfi: string) => {
		setLocation(epubcfi);
	}, []);

	const readerHeader = useMemo(() => (
		<div className="flex gap-2 items-center p-2">
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

		// Conecta listeners do hook
		const detach = attachToRendition(rendition);
		return detach;
	}, [applyTheme, readingMode]);

	React.useEffect(() => {
		applyTheme();
	}, [applyTheme]);

	// Reapply é tratado dentro do hook

	// Atalhos, undo e reapply são tratados no hook

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
					onRemove={(id, cfi) => removeHighlight(id, cfi)}
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
			{pendingSelection && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/50" onClick={handleCancelPending} />
					<div className="relative mx-4 w-full max-w-md rounded-2xl bg-white shadow-xl">
						<div className="p-6 text-center">
							<div className="mx-auto mb-3 grid place-items-center size-12 rounded-full bg-amber-100">
								<svg viewBox="0 0 24 24" fill="currentColor" className="text-amber-600 size-7" aria-hidden="true">
									<path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 14h-2v-2h2Zm0-4h-2V6h2Z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold">Criar destaque?</h3>
							<p className="mt-1 text-sm text-slate-600 line-clamp-3" title={pendingSelection.text}>
								“{pendingSelection.text || 'trecho selecionado'}”
							</p>
							<div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-600">
								<span>Cor atual</span>
								<span className="inline-block size-3 rounded-full border" style={{ backgroundColor: highlightColor }} />
								<span className="font-mono">{highlightColor}</span>
							</div>
							<div className="mt-5 space-y-2">
								<button onClick={handleConfirmHighlight} className="w-full rounded-full bg-orange-500 px-4 py-3 text-white font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300">
									Sim, criar destaque
								</button>
								<button onClick={handleCancelPending} className="w-full rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100">
									Cancelar
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{pendingUndo && (
				<div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-2 rounded shadow text-sm flex items-center gap-3">
					<span>Destaque criado.</span>
					<button className="underline decoration-2 underline-offset-2" onClick={handleUndoLastHighlight}>Desfazer</button>
					<button className="opacity-70 hover:opacity-100" onClick={dismissUndo} aria-label="Fechar">×</button>
				</div>
			)}
		</div>
	);
};

export default EbookReader;


