import React from 'react';
import EbookReader from './EbookReader';
import BookSelector, { BookInfo } from './components/BookSelector';

/**
 * TODO:
 * - Implementar voltar a pagina referente a uma % integrado ao useReadingProgress
 * - Tentar corrigir o gatilho de destaque de texto no mobile
 */

const App: React.FC = () => {
  const [selected, setSelected] = React.useState<BookInfo | null>(null);

  if (!selected) {
    return (
      <BookSelector
        onSelect={(bk) => setSelected(bk)}
        header={(
          <div className="p-3 border-b bg-white">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="text-sm text-slate-600">Biblioteca</div>
            </div>
          </div>
        )}
      />
    );
  }

  return (
    <div className="App">
      <EbookReader
        bookUrl={`/asset/${selected.file}`}
        bookTitle={selected.title}
        onChangeBook={() => setSelected(null)}
      />
    </div>
  );
};

export default App;
