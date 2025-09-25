import React from 'react';

export type BookInfo = {
	title: string;
	file: string;
};

type Props = {
	onSelect: (book: BookInfo) => void;
	manifestUrl?: string;
	header?: React.ReactNode;
};

const DEFAULT_MANIFEST = '/asset/manifest.json';

const BookSelector: React.FC<Props> = ({ onSelect, manifestUrl = DEFAULT_MANIFEST, header }) => {
	const [books, setBooks] = React.useState<BookInfo[]>([]);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		let isMounted = true;
		setLoading(true);
		setError(null);
		fetch(manifestUrl)
			.then(async (res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = (await res.json()) as BookInfo[];
				if (!Array.isArray(data)) throw new Error('Manifest inválido');
				if (isMounted) setBooks(data);
			})
			.catch((e) => {
				if (isMounted) setError(e?.message || 'Erro ao carregar manifest');
			})
			.finally(() => {
				if (isMounted) setLoading(false);
			});
		return () => {
			isMounted = false;
		};
	}, [manifestUrl]);

	if (loading) {
		return (
			<div className="h-screen grid place-items-center">
				<div className="text-slate-600">Carregando livros…</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-screen grid place-items-center">
				<div className="text-red-600">Falha ao carregar livros: {error}</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			{header}
			<div className="flex-1 p-6">
				<h1 className="text-xl font-semibold mb-4">Escolha um livro</h1>
				<ul className="grid gap-3">
					{books.map((bk) => (
						<li key={bk.file}>
							<button
								className="w-full text-left p-3 border rounded hover:bg-slate-50"
								onClick={() => onSelect(bk)}
							>
								<div className="font-medium">{bk.title}</div>
								<div className="text-xs text-slate-500">{bk.file}</div>
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default BookSelector;
