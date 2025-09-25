import React from 'react';

type UseReaderLocationReturn = {
	location: string | number;
	setLocation: React.Dispatch<React.SetStateAction<string | number>>;
	handleLocationChanged: (epubcfi: string) => void;
};

export default function useReaderLocation(): UseReaderLocationReturn {
	const [location, setLocation] = React.useState<string | number>(0);
	const handleLocationChanged = React.useCallback((epubcfi: string) => { setLocation(epubcfi); }, []);
	return { location, setLocation, handleLocationChanged };
}


