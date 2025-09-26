import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ReactReader } from 'react-reader';
import FontFamilySelector from './components/FontFamilySelector';
import FontSizeSelector from './components/FontSizeSelector';
import ReadingModeToggle from './components/ReadingModeToggle';
import ThemeToggle from './components/ThemeToggle';
import HighlightColorSelector from './components/HighlightColorSelector';
import HighlightsList from './components/HighlightsList';
import ToolbarDesktop from './components/ToolbarDesktop';
import ToolbarMobile from './components/ToolbarMobile';
import useHighlighting from './hooks/useHighlighting';
import useReaderTheme from './hooks/useReaderTheme';
import useReadingMode from './hooks/useReadingMode';
import useReaderLocation from './hooks/useReaderLocation';
import useHighlightSettings from './hooks/useHighlightSettings';
import useRenditionBinder from './hooks/useRenditionBinder';
import useReadingProgress from './hooks/useReadingProgress';

type Props = {
	bookUrl: string;
	bookTitle?: string;
	onChangeBook?: () => void;
	percent?: number; // 0-100
};

const EbookReader: React.FC<Props> = ({ bookUrl, bookTitle = 'EPUB', onChangeBook, percent }) => {

	const { location, setLocation, handleLocationChanged } = useReaderLocation();
	const { fontFamily, setFontFamily, fontSize, setFontSize, themeMode, setThemeMode, bindToRendition: bindTheme, applyTheme } = useReaderTheme();
	const { readingMode, setReadingMode, epubOptions, bindScrollBehavior } = useReadingMode();
	const { renditionRef, bindAll } = useRenditionBinder();
	const { highlightColor, setHighlightColor, showHighlights, setShowHighlights } = useHighlightSettings();
	const { attachToRendition: attachReadingProgress, goToPercentage } = useReadingProgress({
		step: 5,
		onProgress: (percent) => {
			// eslint-disable-next-line no-console
			console.log(`[Leitura] ${percent}%`);
		},
	});

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

	const leftControls = (
		<>
			<ReadingModeToggle mode={readingMode} onChange={setReadingMode} />
			<ThemeToggle value={themeMode} onChange={setThemeMode} />
		</>
	);

	const centerControls = (
		<>
			<FontFamilySelector value={fontFamily} onChange={setFontFamily} />
			<FontSizeSelector value={fontSize} onChange={setFontSize} />
		</>
	);

	const rightControls = (
		<div className="flex flex-row items-center gap-8">
			<div className="inline-flex items-center gap-2 whitespace-nowrap">
				<div className="flex flex-row items-center gap-2">
					<span className="text-slate-600 text-xs">{bookTitle}</span>
					{onChangeBook && (
						<button
							className="px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100 shrink-0"
							onClick={onChangeBook}
						>
							Trocar livro
						</button>
					)}
				</div>
			</div>
			<div className="flex flex-row items-center gap-2">
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
				{/* {readingMode === 'paginated' && (
					<div className="ml-2 inline-flex items-center gap-1">
						<button
							className="px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100"
							onClick={() => renditionRef.current?.prev?.()}
							aria-label="Página anterior"
						>
							Anterior
						</button>
						<button
							className="px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100"
							onClick={() => renditionRef.current?.next?.()}
							aria-label="Próxima página"
						>
							Próxima
						</button>
					</div>
				)} */}
			</div>
		</div>
	);

	const mobilePanelContent = (
		<>
			<div className="flex flex-col gap-2">
				<span className="text-slate-600 text-xs">Modo</span>
				{leftControls}
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-slate-600 text-xs">Aparência</span>
				{centerControls}
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-slate-600 text-xs">Livro</span>
				<div className="inline-flex items-center gap-2 whitespace-nowrap">
					<span className="text-slate-600 text-xs">{bookTitle}</span>
					{onChangeBook && (
						<button
							className="px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100 shrink-0"
							onClick={onChangeBook}
						>
							Trocar livro
						</button>
					)}
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-slate-600 text-xs">Destaques</span>
				<div className="flex items-center gap-2">
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
					{/* {readingMode === 'paginated' && (
						<div className="ml-2 inline-flex items-center gap-1">
							<button
								className="px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100"
								onClick={() => renditionRef.current?.prev?.()}
								aria-label="Página anterior"
							>
								Anterior
							</button>
							<button
								className="px-3 py-1.5 rounded-md border text-xs leading-none bg-slate-50 border-slate-300 hover:bg-slate-100"
								onClick={() => renditionRef.current?.next?.()}
								aria-label="Próxima página"
							>
								Próxima
							</button>
						</div>
					)} */}
				</div>
			</div>
		</>
	);

	const readerHeader = useMemo(() => (
		<>
			<ToolbarDesktop left={leftControls} center={centerControls} right={rightControls} />
			<ToolbarMobile content={mobilePanelContent} />
		</>
	), [readingMode, themeMode, fontFamily, fontSize, highlightColor, highlights.length, highlightMode, bookTitle, onChangeBook, setReadingMode, setThemeMode, setFontFamily, setFontSize, setHighlightMode, setShowHighlights]);

	const applyThemeLocal = useCallback(() => { applyTheme(); }, [applyTheme]);

	const handleGetRendition = useCallback((rendition: any) => {
		bindAll(rendition);
		bindTheme(rendition);
		try {
			bindScrollBehavior(renditionRef.current);
		} catch { }

		const detachHighlights = attachToRendition(rendition);
		const detachProgress = attachReadingProgress(rendition);

		try {
			if (typeof percent === 'number') {
				void goToPercentage(percent);
			}
		} catch { }
		return () => {
			try { detachHighlights?.(); } catch { }
			try { detachProgress?.(); } catch { }
		};
	}, [bindTheme, bindScrollBehavior, bindAll, readingMode, attachToRendition, attachReadingProgress, goToPercentage, percent]);
	// Navegar quando a porcentagem mudar após montado
	React.useEffect(() => {
		if (typeof percent !== 'number') return;
		try { void goToPercentage(percent); } catch { }
	}, [percent, goToPercentage]);

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
					key={`reader-${readingMode}-${bookUrl}`}
					title={bookTitle}
					url={bookUrl}
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


