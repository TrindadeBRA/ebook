import React from 'react';

export type HighlightItem = {
	id: string;
	text: string;
	cfiRange: string;
	color: string;
};

type Params = {
	highlightColor: string;
	readingMode: 'paginated' | 'scrolled';
};

type UseHighlightingReturn = {
	highlightMode: boolean;
	setHighlightMode: React.Dispatch<React.SetStateAction<boolean>>;
	highlights: HighlightItem[];
	pendingSelection: { cfiRange: string; text: string } | null;
	pendingUndo: { id: string; cfiRange: string } | null;
	attachToRendition: (rendition: any) => void;
	handleConfirmHighlight: () => void;
	handleCancelPending: () => void;
	handleUndoLastHighlight: () => void;
	removeHighlight: (id: string, cfiRange?: string) => void;
	dismissUndo: () => void;
};

export default function useHighlighting(params: Params): UseHighlightingReturn {
	const { highlightColor, readingMode } = params as any;
	const renditionRef = React.useRef<any | null>(null);
	const selectionDelayRef = React.useRef<number | null>(null);
	const contentCleanupRef = React.useRef<Array<() => void>>([]);
	const SELECTION_MIN_CHARS = 3;
	const SELECTION_DELAY_MS = 350;
	const [highlightMode, setHighlightMode] = React.useState<boolean>(false);
	const [highlights, setHighlights] = React.useState<HighlightItem[]>([]);
	const [pendingSelection, setPendingSelection] = React.useState<{ cfiRange: string; text: string } | null>(null);
	const [pendingUndo, setPendingUndo] = React.useState<{ id: string; cfiRange: string } | null>(null);
	const toastTimeoutRef = React.useRef<number | null>(null);
	const highlightModeRef = React.useRef<boolean>(false);
	const highlightColorRef = React.useRef<string>(highlightColor);
	const pendingSelectionRef = React.useRef<boolean>(false);

	// Sync refs
	React.useEffect(() => { highlightModeRef.current = highlightMode; }, [highlightMode]);
	React.useEffect(() => { highlightColorRef.current = highlightColor; }, [highlightColor]);
	React.useEffect(() => { pendingSelectionRef.current = Boolean(pendingSelection); }, [pendingSelection]);

	const attachToRendition = React.useCallback((rendition: any) => {
		renditionRef.current = rendition;

		const detachAllContentListeners = () => {
			for (const fn of contentCleanupRef.current) try { fn(); } catch {}
			contentCleanupRef.current = [];
		};

		const attachPointerHandlers = (contents: any) => {
			if (!contents?.document) return;
			const handlePointerUp = () => {
				try {
					if (!highlightModeRef.current) return;
					const selection = contents?.window?.getSelection?.();
					if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
					const range = selection.getRangeAt(0);
					const text = String(range.toString());
					const normalized = text.trim();
					if (!normalized || normalized.length < SELECTION_MIN_CHARS) return;
					let cfiRange: string | null = null;
					try { cfiRange = contents.cfiFromRange?.(range) || null; } catch { cfiRange = null; }
					if (!cfiRange) return;
					if (selectionDelayRef.current) { window.clearTimeout(selectionDelayRef.current); selectionDelayRef.current = null; }
					selectionDelayRef.current = window.setTimeout(() => {
						if (!highlightModeRef.current) return;
						setPendingSelection({ cfiRange: cfiRange as string, text });
					}, SELECTION_DELAY_MS);
				} catch {}
			};
			contents.document.addEventListener('mouseup', handlePointerUp);
			contents.document.addEventListener('touchend', handlePointerUp, { passive: true });
			contentCleanupRef.current.push(() => {
				try { contents.document.removeEventListener('mouseup', handlePointerUp); } catch {}
				try { contents.document.removeEventListener('touchend', handlePointerUp); } catch {}
			});
		};

		const attachToAllContents = () => {
			try {
				const contentsList = renditionRef.current?.getContents?.() || [];
				for (const c of contentsList) attachPointerHandlers(c);
			} catch {}
		};

		attachToAllContents();
		renditionRef.current?.on?.('rendered', attachToAllContents);

		return () => {
			if (selectionDelayRef.current) { window.clearTimeout(selectionDelayRef.current); selectionDelayRef.current = null; }
			try { renditionRef.current?.off?.('rendered', attachToAllContents); } catch {}
			detachAllContentListeners();
		};
	}, []);

	// Reapply highlights on reading mode change
	React.useEffect(() => {
		if (!renditionRef.current) return;
		try {
			for (const h of highlights) {
				renditionRef.current.annotations?.remove?.(h.cfiRange, 'highlight');
				renditionRef.current.annotations?.add?.('highlight', h.cfiRange, {}, () => {}, 'epubjs-hl', { fill: h.color, 'fill-opacity': 0.35 });
			}
		} catch {}
	}, [readingMode, highlights]);

	const handleConfirmHighlight = React.useCallback(() => {
		if (!pendingSelection) return;
		const { cfiRange, text } = pendingSelection;
		const id = `${cfiRange}-${Date.now()}`;
		const color = highlightColorRef.current;
		try {
			renditionRef.current?.annotations?.remove?.(cfiRange, 'highlight');
			renditionRef.current?.annotations?.add?.('highlight', cfiRange, {}, () => {}, 'epubjs-hl', { fill: color, 'fill-opacity': 0.35 });
			setHighlights((prev) => prev.concat([{ id, text, cfiRange, color }]));
			setPendingUndo({ id, cfiRange });
		} catch {}
		// Clear selections inside iframes
		try {
			const contents = renditionRef.current?.getContents?.() || [];
			for (const c of contents) { c?.window?.getSelection?.()?.removeAllRanges(); }
		} catch {}
		setPendingSelection(null);
	}, [pendingSelection]);

	const handleCancelPending = React.useCallback(() => {
		setPendingSelection(null);
	}, []);

	const handleUndoLastHighlight = React.useCallback(() => {
		if (!pendingUndo) return;
		try { renditionRef.current?.annotations?.remove?.(pendingUndo.cfiRange, 'highlight'); } catch {}
		setHighlights((prev) => prev.filter((h) => h.id !== pendingUndo.id));
		setPendingUndo(null);
	}, [pendingUndo]);

	const dismissUndo = React.useCallback(() => {
		setPendingUndo(null);
	}, []);

	// Auto hide toast
	React.useEffect(() => {
		if (!pendingUndo) return;
		if (toastTimeoutRef.current) { window.clearTimeout(toastTimeoutRef.current); toastTimeoutRef.current = null; }
		toastTimeoutRef.current = window.setTimeout(() => setPendingUndo(null), 4000);
		return () => { if (toastTimeoutRef.current) { window.clearTimeout(toastTimeoutRef.current); toastTimeoutRef.current = null; } };
	}, [pendingUndo]);

	// Keyboard shortcuts: prioritize modal
	React.useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (pendingSelectionRef.current) {
				if (e.key === 'Enter') { e.preventDefault(); handleConfirmHighlight(); return; }
				if (e.key === 'Escape') { e.preventDefault(); handleCancelPending(); return; }
			}
			const isToggle = (e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H');
			if (isToggle) { e.preventDefault(); setHighlightMode((v) => !v); return; }
			if (e.key === 'Escape' && highlightModeRef.current) { e.preventDefault(); setHighlightMode(false); }
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [handleConfirmHighlight, handleCancelPending]);

	const removeHighlight = React.useCallback((id: string, cfiRange?: string) => {
		const highlight = highlights.find((h) => h.id === id);
		const cfi = cfiRange || highlight?.cfiRange;
		if (!cfi) { setHighlights((prev) => prev.filter((h) => h.id !== id)); return; }
		try { renditionRef.current?.annotations?.remove?.(cfi, 'highlight'); } catch {}
		setHighlights((prev) => prev.filter((h) => h.id !== id));
		if (pendingUndo?.id === id) setPendingUndo(null);
	}, [highlights, pendingUndo]);

	return {
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
	};
}


