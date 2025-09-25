import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ReactReader } from 'react-reader';
import FontFamilySelector from './components/FontFamilySelector';
import FontSizeSelector from './components/FontSizeSelector';
import ReadingModeToggle from './components/ReadingModeToggle';
import ThemeToggle from './components/ThemeToggle';
import HighlightColorSelector from './components/HighlightColorSelector';
import HighlightsList from './components/HighlightsList';
import useHighlighting from './hooks/useHighlighting';
import useReaderTheme from './hooks/useReaderTheme';
import useReadingMode from './hooks/useReadingMode';
import useReaderLocation from './hooks/useReaderLocation';
import useHighlightSettings from './hooks/useHighlightSettings';
import useRenditionBinder from './hooks/useRenditionBinder';

const EbookReader: React.FC = () => {

	const { location, setLocation, handleLocationChanged } = useReaderLocation();
	const { fontFamily, setFontFamily, fontSize, setFontSize, themeMode, setThemeMode, bindToRendition: bindTheme, applyTheme } = useReaderTheme();
	const { readingMode, setReadingMode, epubOptions, bindScrollBehavior } = useReadingMode();
	const { renditionRef, bindAll } = useRenditionBinder();
	const { highlightColor, setHighlightColor, showHighlights, setShowHighlights } = useHighlightSettings();

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

	const applyThemeLocal = useCallback(() => { applyTheme(); }, [applyTheme]);

	const handleGetRendition = useCallback((rendition: any) => {
		bindAll(rendition);
		bindTheme(rendition);
		try {
			bindScrollBehavior(renditionRef.current);
		} catch { }

		const detach = attachToRendition(rendition);
		return detach;
	}, [bindTheme, bindScrollBehavior, bindAll, readingMode]);

React.useEffect(() => { applyThemeLocal(); }, [applyThemeLocal]);
React.useEffect(() => { if (renditionRef.current) bindScrollBehavior(renditionRef.current); }, [bindScrollBehavior]);

	return (
		<div className="h-screen flex flex-col">
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


