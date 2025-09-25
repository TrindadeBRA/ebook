import React from 'react';

type UseHighlightSettingsReturn = {
	highlightColor: string;
	setHighlightColor: React.Dispatch<React.SetStateAction<string>>;
	showHighlights: boolean;
	setShowHighlights: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function useHighlightSettings(): UseHighlightSettingsReturn {
	const [highlightColor, setHighlightColor] = React.useState<string>('#ef4444');
	const [showHighlights, setShowHighlights] = React.useState<boolean>(false);
	return { highlightColor, setHighlightColor, showHighlights, setShowHighlights };
}


