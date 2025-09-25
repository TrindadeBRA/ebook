# Leitor de Ebook EPUB - Prova de Conceito

Uma aplicação React TypeScript para visualização de arquivos EPUB com funcionalidades avançadas de leitura.

## Funcionalidades Implementadas

### 📖 Navegação
- **Lista de Capítulos**: Exibe todos os capítulos do ebook e permite navegação direta
- **Navegação por Páginas**: Botões para avançar e voltar páginas
- **Modos de Navegação**:
  - Lista Infinita: Conteúdo em scroll contínuo
  - Paginada: Conteúdo dividido em páginas responsivas

### 🎨 Personalização Visual
- **Temas de Cores**:
  - Branco: Fundo branco, texto preto
  - Preto: Fundo preto, texto branco
  - Amarelo: Fundo amarelo, texto preto
- **Controle de Fonte**:
  - Tipos: Serif, Sans-serif, Monospace
  - Tamanhos: Pequeno (12px), Médio (16px), Grande (20px), Muito Grande (24px)

### ✏️ Sistema de Destaques
- **Destacar Texto**: Seleção de texto com cores personalizáveis
- **Cores Disponíveis**: Amarelo, Verde, Azul, Rosa, Laranja
- **Lista de Destaques**: Visualizar e gerenciar todos os destaques
- **Ações**: Visualizar destaque no texto ou remover

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para Execução

1. **Instalar dependências**:
   ```bash
   cd front
   npm install
   ```

2. **Executar o projeto**:
   ```bash
   npm start
   ```

3. **Acessar a aplicação**:
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

### Build para Produção

```bash
npm run build
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── EbookReader.tsx      # Componente principal do leitor
│   ├── Toolbar.tsx          # Barra de ferramentas
│   ├── ChaptersPanel.tsx    # Painel de capítulos
│   └── HighlightsPanel.tsx  # Painel de destaques
├── hooks/
│   └── useTextHighlighting.ts # Hook para destaque de texto
├── types/
│   └── index.ts             # Definições de tipos TypeScript
├── App.tsx                  # Componente raiz
├── index.tsx               # Ponto de entrada
└── index.css               # Estilos globais
```

## Tecnologias Utilizadas

- **React 18** com TypeScript
- **react-reader** para renderização de EPUB
- **Tailwind CSS** para estilização e temas
- **Hooks personalizados** para gerenciamento de estado

## Como Usar

1. **Carregar um Ebook**: Coloque um arquivo .epub na pasta `public/asset/` e atualize a URL no `App.tsx`

2. **Navegar pelos Capítulos**: Clique no botão "Capítulos" na barra de ferramentas

3. **Personalizar a Leitura**: Use os controles de tema, fonte e tamanho na barra de ferramentas

4. **Destacar Texto**: 
   - Ative o modo de destaque
   - Selecione a cor desejada
   - Selecione o texto no ebook
   - Visualize os destaques no painel correspondente

5. **Alterar Modo de Navegação**: Escolha entre "Paginado" ou "Lista Infinita"

## Recursos Técnicos

- **Responsivo**: Adapta-se a diferentes tamanhos de tela com Tailwind CSS
- **Acessível**: Suporte a navegação por teclado
- **Performance**: Carregamento otimizado de ebooks
- **TypeScript**: Tipagem forte para melhor manutenibilidade
- **Tailwind CSS**: Estilização moderna e responsiva
- **Componentes Reutilizáveis**: Arquitetura modular e escalável

## Limitações Conhecidas

- O sistema de destaque de texto é uma implementação simplificada
- A persistência dos destaques é apenas em memória (não salva no localStorage)
- Suporte limitado a ebooks com estruturas complexas

## Próximos Passos

- Implementar persistência de destaques
- Adicionar mais opções de personalização
- Melhorar o sistema de destaque de texto
- Adicionar suporte a anotações
- Implementar busca no texto
# poc-ebook
