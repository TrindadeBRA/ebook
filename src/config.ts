// Configurações da aplicação
export const APP_CONFIG = {
  name: 'Leitor de Ebook EPUB',
  version: '1.0.0',
  defaultEpubUrl: '/asset/demo.epub',
  supportedFormats: ['.epub'],
  maxFileSize: 50 * 1024 * 1024, // 50MB
};

// Configurações de fonte
export const FONT_CONFIG = {
  families: [
    { label: 'Serif', value: 'serif' },
    { label: 'Sans-serif', value: 'sans-serif' },
    { label: 'Monospace', value: 'monospace' }
  ],
  sizes: [
    { label: 'Pequeno', value: '12px' },
    { label: 'Médio', value: '16px' },
    { label: 'Grande', value: '20px' },
    { label: 'Muito Grande', value: '24px' }
  ]
};

// Configurações de tema
export const THEME_CONFIG = [
  { label: 'Branco', value: 'white' },
  { label: 'Preto', value: 'black' },
  { label: 'Amarelo', value: 'yellow' }
];

// Configurações de cores para destaque
export const HIGHLIGHT_COLORS = [
  { label: 'Amarelo', value: 'yellow' },
  { label: 'Verde', value: 'lightgreen' },
  { label: 'Azul', value: 'lightblue' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Laranja', value: 'orange' }
];
