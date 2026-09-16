# Diagnóstico visual FS

## Estrutura

- `components/ui/iphone-mockup.tsx`: componente fornecido pelo usuário, com os modelos, proporções, safe areas, molduras e props preservados. Um atributo `data-home-indicator` permite adaptar a cor da barra ao fundo claro.
- `components/ui/iphone-mockup-demo.tsx`: exemplo fornecido; não integra o site público.
- `components/diagnostic-showcase.tsx`: quatro telas de computador e celular, pré-renderizadas por React no build.
- `public/diagnostic.css`: estilo das janelas macOS, aplicação de exemplo e responsividade.
- `public/diagnostic.js`: sincronização, rotação automática a cada 6 segundos, pausa e preferência por movimento reduzido.
- `styles/ui.css`: entrada Tailwind, sem preflight global para preservar o site existente.
- `components.json`: aliases e estrutura shadcn; componentes reutilizáveis em `components/ui`, utilitário `cn` em `lib/utils.ts`.
- `tsconfig.json`: TypeScript e alias `@/` para a raiz.

O projeto usa um gerador estático próprio. React renderiza os componentes em HTML durante o build com `renderToStaticMarkup`; a animação usa JavaScript pequeno no navegador. Não há necessidade de providers, hooks, imagens de banco ou ícones externos para este mockup. Componentes interativos futuros do shadcn que usam hooks precisarão de uma ilha React com hidratação; a configuração atual não hidrata componentes automaticamente.

## Comandos

```sh
npm install
npm run typecheck
FS_SITE_MODE=production npm run build
npm run check
node scripts/serve.mjs
```

Prévia: http://localhost:4173/#diagnostico

O build executa esbuild para TSX e Tailwind CLI para CSS. `.generated/` é intermediário local e é recriado; apenas `dist/` contém o site final. A pasta padrão `components/ui` mantém os componentes do 21st/shadcn separados da composição específica da página e é resolvida pelo alias solicitado.

## Conteúdo

A cobertura foi orientada pelo relatório local `Relatorio_Serpro_FS_Solucoes_Tributarias.pdf`, páginas 1–2 e 4–5:

1. Diagnóstico: total demonstrativo R$ 339.680 = PGFN R$ 286.400 + Receita Federal R$ 53.280.
2. Receita: situação fiscal e conferência de documentos. IRPJ R$ 24.000 + CSLL R$ 16.480 + PIS/Cofins R$ 12.800 = R$ 53.280.
3. PGFN: valores e inscrições agrupados. IRPJ R$ 126.800 + CSLL R$ 84.900 + PIS/Cofins R$ 74.700 = R$ 286.400; 4 + 3 + 2 = 9 inscrições.
4. Estratégia: CAPAG, histórico de negociações, documentos financeiros e processuais apresentados como complementação, sem afirmar cobertura automática.

Todos os valores e dados da interface são fictícios. Não há consulta Serpro, coleta de CNPJ ou resultado fiscal real nesta seção. Não foram incorporados nomes, valores ou dados reais do parecer mencionado no PDF. O botão “Quero fazer meu diagnóstico agora” abre `/diagnostico/`, que coleta os dados da empresa antes de encaminhar ao WhatsApp. O contrato do webhook está em `DIAGNOSTICO-WEBHOOK.md`.

## Referências técnicas

- https://react.dev/reference/react-dom/server/renderToStaticMarkup
- https://tailwindcss.com/docs/installation/tailwind-cli
- https://ui.shadcn.com/docs/components-json

## Publicação

A revisão foi avaliada em localhost. O usuário autorizou a publicação desta versão na Vercel em 15/09/2026.
