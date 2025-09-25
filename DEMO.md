# 🎯 Demonstração do Leitor de Ebook EPUB

## Como Testar a Aplicação

### 1. Preparação
```bash
# Navegue para o diretório do projeto
cd /home/trindadebra/Documentos/uds/mletras/POCS/ebook/front

# Execute o script de instalação e execução
./install-and-run.sh
```

**Nota**: O projeto agora usa **Tailwind CSS** para estilização, proporcionando:
- Design responsivo e moderno
- Classes utilitárias para desenvolvimento rápido
- Temas personalizáveis
- Interface mais limpa e profissional

### 2. Funcionalidades para Testar

#### 📖 Navegação por Capítulos
1. Clique no botão "📖 Capítulos" na barra de ferramentas
2. Selecione um capítulo da lista
3. O ebook navegará para o capítulo selecionado

#### ⏭️ Navegação por Páginas
1. Use os botões "← Anterior" e "Próxima →" para navegar
2. Teste em diferentes capítulos

#### 🎨 Personalização Visual

**Temas:**
- Selecione "Branco", "Preto" ou "Amarelo" no dropdown de tema
- Observe a mudança de cores do fundo e texto

**Fonte:**
- Altere o tipo: Serif, Sans-serif, Monospace
- Altere o tamanho: Pequeno, Médio, Grande, Muito Grande

**Modo de Navegação:**
- Teste "Paginado" (padrão)
- Teste "Lista Infinita" para scroll contínuo

#### ✏️ Sistema de Destaques

1. **Ativar Modo de Destaque:**
   - Clique no botão "✏️ Destacar"
   - O botão ficará ativo (azul)

2. **Selecionar Cor:**
   - Escolha uma cor no dropdown ao lado do botão de destaque

3. **Destacar Texto:**
   - Com o modo ativo, selecione qualquer texto no ebook
   - O texto será destacado automaticamente

4. **Gerenciar Destaques:**
   - Clique em "🎯 Destaques" para ver a lista
   - Use "👁️ Visualizar" para ir ao destaque
   - Use "🗑️ Remover" para excluir

### 3. Cenários de Teste

#### Cenário 1: Leitura Básica
1. Carregue um ebook
2. Navegue pelos capítulos
3. Altere o tema para "Preto"
4. Aumente o tamanho da fonte para "Grande"

#### Cenário 2: Destaques e Anotações
1. Ative o modo de destaque
2. Selecione a cor "Verde"
3. Destaque várias passagens importantes
4. Acesse a lista de destaques
5. Visualize e remova alguns destaques

#### Cenário 3: Personalização Completa
1. Configure tema "Amarelo"
2. Fonte "Monospace" tamanho "Muito Grande"
3. Modo "Lista Infinita"
4. Destaque texto com cor "Azul"

### 4. Verificações de Funcionalidade

✅ **Navegação por Capítulos**: Lista carrega e navegação funciona
✅ **Navegação por Páginas**: Botões anterior/próxima funcionam
✅ **Temas**: Mudança de cores aplicada corretamente
✅ **Controles de Fonte**: Tipo e tamanho alteram a aparência
✅ **Modos de Navegação**: Alternância entre paginado e lista infinita
✅ **Sistema de Destaques**: Seleção, aplicação e gerenciamento funcionam
✅ **Interface Responsiva**: Funciona em diferentes tamanhos de tela

### 5. Arquivos de Teste

O projeto inclui um arquivo `demo.epub` na pasta `asset/` para testes. Você pode:
- Substituir por outros arquivos EPUB
- Testar com diferentes estruturas de capítulos
- Verificar compatibilidade com diferentes formatos

### 6. Troubleshooting

**Problema**: Ebook não carrega
- Verifique se o arquivo está na pasta `public/asset/`
- Confirme se o arquivo é um EPUB válido

**Problema**: Destaques não funcionam
- Certifique-se de que o modo de destaque está ativo
- Verifique se há texto selecionado

**Problema**: Estilos não aplicam
- Verifique se o tema foi selecionado corretamente
- Confirme se a fonte foi alterada

### 7. Próximos Passos para Desenvolvimento

- Implementar persistência de destaques no localStorage
- Adicionar mais opções de personalização
- Melhorar o sistema de destaque de texto
- Implementar busca no conteúdo
- Adicionar suporte a anotações
- Implementar exportação de destaques
