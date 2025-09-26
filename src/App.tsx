import React from 'react';
import EbookReader from './EbookReader';
import BookSelector, { BookInfo } from './components/BookSelector';

/**
 * TODO:
 * - Tentar corrigir o gatilho de destaque de texto no mobile
 */

// se celular ios, executar um alerta para instalar o app
if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
  alert('Instale o app para uma melhor experiência');
}

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
        percent={95}
      />
    </div>
  );
};

export default App;
