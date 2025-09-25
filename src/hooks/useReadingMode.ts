import React from 'react';

export type ReadingMode = 'paginated' | 'scrolled';

type UseReadingModeReturn = {
	readingMode: ReadingMode;
	setReadingMode: React.Dispatch<React.SetStateAction<ReadingMode>>;
	epubOptions: any;
	bindScrollBehavior: (rendition: any) => void;
};

export default function useReadingMode(): UseReadingModeReturn {
	const [readingMode, setReadingMode] = React.useState<ReadingMode>('scrolled');

	const epubOptions = React.useMemo(() => {
		if (readingMode === 'scrolled') {
			return { flow: 'scrolled', manager: 'continuous', spread: 'none', allowPopups: false, allowScriptedContent: false } as const;
		}
		return { flow: 'paginated', manager: 'default', spread: 'always', allowPopups: false, allowScriptedContent: false } as const;
	}, [readingMode]);

	const bindScrollBehavior = React.useCallback((rendition: any) => {
		try {
			if (!rendition?.manager?.container?.style) return;
			if (readingMode === 'scrolled') {
				rendition.manager.container.style['scroll-behavior'] = 'smooth';
			} else {
				rendition.manager.container.style.removeProperty('scroll-behavior');
			}
		} catch {}
	}, [readingMode]);

	React.useEffect(() => {
		// noop; hook consumer pode chamar bindScrollBehavior no efeito de modo
	}, [readingMode]);

	return { readingMode, setReadingMode, epubOptions, bindScrollBehavior };
}


