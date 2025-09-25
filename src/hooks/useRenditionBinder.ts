import React from 'react';

type UseRenditionBinderReturn = {
	renditionRef: React.MutableRefObject<any | null>;
	bindAll: (rendition: any) => void;
};

export default function useRenditionBinder(): UseRenditionBinderReturn {
	const renditionRef = React.useRef<any | null>(null);
	const bindAll = React.useCallback((rendition: any) => { renditionRef.current = rendition; }, []);
	return { renditionRef, bindAll };
}


