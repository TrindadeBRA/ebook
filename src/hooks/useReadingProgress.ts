import React from 'react';

type ProgressMethod = 'locations' | 'spine+displayed' | 'unknown';

type ProgressInfo = {
	percent: number;
	fraction: number;
	cfi: string;
	spineIndex?: number;
	spineItems?: number;
	chapterPage?: number;
	chapterTotal?: number;
	method: ProgressMethod;
};

type Options = {
	step?: number;
	onProgress?: (percent: number, info: ProgressInfo) => void;
};

type UseReadingProgressReturn = {
	attachToRendition: (rendition: any) => () => void;
	percent: number;
	goToPercent: (percent: number) => Promise<void>;
};

export default function useReadingProgress(options?: Options): UseReadingProgressReturn {
	const { step = 5, onProgress } = options || {};
	const renditionRef = React.useRef<any | null>(null);
	const lastChunkRef = React.useRef<number>(-1);
	const [percent, setPercent] = React.useState<number>(0);

	const goToPercent = React.useCallback(async (targetPercent: number) => {
		try {
			const rendition = renditionRef.current;
			const book = (rendition as any)?.book;
			if (!rendition || !book) return;

			const clamped = Math.max(0, Math.min(100, Number.isFinite(targetPercent) ? targetPercent : 0));
			const fraction = clamped / 100;

			try { await (book as any).ready; } catch {}
			try {
				if (book.locations && (!book.locations.length || book.locations.length === 0)) {
					try { await book.locations.generate(1500); } catch {}
				}
			} catch {}

			// Preferir cfiFromPercentage quando disponível
			try {
				const hasCFIFromPct = Boolean(book?.locations?.cfiFromPercentage);
				if (hasCFIFromPct) {
					const cfi = book.locations.cfiFromPercentage(fraction);
					if (cfi) {
						await (rendition as any).display(cfi);
						return;
					}
				}
			} catch {}

			// Fallback: usar índice do spine aproximado
			try {
				const totalSpine: number = book?.spine?.spineItems?.length || 0;
				if (totalSpine > 0) {
					const idx = Math.max(0, Math.min(totalSpine - 1, Math.floor(fraction * (totalSpine - 1))));
					const href = book.spine.spineItems[idx]?.href;
					if (href) {
						await (rendition as any).display(href);
						return;
					}
				}
			} catch {}
		} catch {}
	}, []);

	const computeAndMaybeNotify = React.useCallback((location: any) => {
		try {
			const rendition = renditionRef.current;
			if (!rendition || !location) return;
			const book = (rendition as any)?.book;
			const cfi = location?.start?.cfi || location?.start?.cfiRange || '';
			let fraction = 0;
			let method: ProgressMethod = 'unknown';

			// Preferência: usar locations do livro se disponíveis
			if (book?.locations?.percentageFromCfi && cfi) {
				try {
					const p = book.locations.percentageFromCfi(cfi);
					if (typeof p === 'number' && isFinite(p)) {
						fraction = Math.max(0, Math.min(1, p));
						method = 'locations';
					}
				} catch {}
			}

			// Fallback: estimar via índice do spine + progresso do capítulo
			if (fraction === 0 && book?.spine?.spineItems?.length) {
				const totalSpine: number = book.spine.spineItems.length;
				const index: number = location?.start?.index ?? 0;
				const displayed = location?.start?.displayed;
				const chapterPage = displayed?.page;
				const chapterTotal = displayed?.total;
				let chapterFraction = 0;
				if (typeof chapterPage === 'number' && typeof chapterTotal === 'number' && chapterTotal > 0) {
					// usar página/total para permitir chegar a 100% no fim do capítulo
					chapterFraction = chapterPage / chapterTotal;
				}
				fraction = Math.max(0, Math.min(1, (index + chapterFraction) / totalSpine));
				method = 'spine+displayed';

				// Se estiver no último spine e na última página do capítulo, forçar 100%
				const isLastSpine = index === totalSpine - 1;
				const isLastPageOfChapter = typeof chapterPage === 'number' && typeof chapterTotal === 'number' && chapterTotal > 0 && chapterPage === chapterTotal;
				if (isLastSpine && isLastPageOfChapter) {
					fraction = 1;
				}
			}

			// Se a API expõe atEnd, garanta 100%
			if (location?.atEnd === true) {
				fraction = 1;
			}

			const pct = Math.min(100, Math.round(fraction * 100));
			setPercent(pct);
			const chunk = Math.floor(pct / step) * step;
			if (chunk !== lastChunkRef.current) {
				lastChunkRef.current = chunk;
				if (onProgress) {
					onProgress(chunk, {
						percent: chunk,
						fraction,
						cfi,
						spineIndex: location?.start?.index,
						spineItems: book?.spine?.spineItems?.length,
						chapterPage: location?.start?.displayed?.page,
						chapterTotal: location?.start?.displayed?.total,
						method,
					});
				} else {
					// Log padrão no console
					// eslint-disable-next-line no-console
					console.log('[ReadingProgress]', `${chunk}%`, { method, cfi });
				}
			}
		} catch {}
	}, [onProgress, step]);

	const attachToRendition = React.useCallback((rendition: any) => {
		renditionRef.current = rendition;
		let offRelocated: (() => void) | null = null;

		const ensureLocations = async () => {
			try {
				const book = (rendition as any)?.book;
				if (!book) return;
				await book.ready;
				if (book.locations && (!book.locations.length || book.locations.length === 0)) {
					try { await book.locations.generate(1500); } catch {}
				}
			} catch {}
		};
		ensureLocations();

		const onRelocated = (location: any) => computeAndMaybeNotify(location);
		try {
			(rendition as any)?.on?.('relocated', onRelocated);
			offRelocated = () => { try { (rendition as any)?.off?.('relocated', onRelocated); } catch {}; };
		} catch {}

		// Cálculo inicial se já houver localização
		try {
			const loc = (rendition as any)?.location;
			if (loc) computeAndMaybeNotify(loc);
		} catch {}

		return () => {
			if (offRelocated) { try { offRelocated(); } catch {} }
		};
	}, [computeAndMaybeNotify]);

	return { attachToRendition, percent, goToPercent };
}


