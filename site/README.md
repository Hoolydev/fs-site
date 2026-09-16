# FS Soluções Tributárias

Site institucional criado em 15/09/2026. Projeto local em `FS site/site`.

## Versão atual

Produção em navy, hero com a sala de reunião, seção Sobre, estrutura do escritório, seis matérias, cinco obras e doze artigos. A página `/diagnostico/` usa conversa guiada com balões, pausa de dois segundos, edição das respostas e autorização de privacidade antes de continuar no WhatsApp. Consulte `scripts/DIAGNOSTICO-WEBHOOK.md` para integração.

Ao importar o GitHub na Vercel, use a pasta raiz `site`.

## Conteúdo inicial (registro de criação)

- Hero com a fotografia de Fernándo Silva integrada ao fundo navy.
- Aparências Navy e Dark com o mesmo conteúdo. Escolha no rodapé; a preferência vale durante a sessão.
- Soluções, apresentação da FS, seis publicações externas (sem duplicar O Globo).
- Cinco obras, suas capas originais, apresentações integrais e páginas individuais.
- Blog com três propostas de textos iniciais escritos para esta versão, filtros por categoria e páginas individuais.
- Contato pelo WhatsApp confirmado no site anterior: (62) 99244-6000.

## Desenvolvimento

Requer Node.js 22 ou superior. Instale as dependências com `npm ci` antes de executar os comandos abaixo.

```sh
npm run build
npm run check
npm run dev
```

A prévia local abre em http://localhost:4173. O gerador produz `dist`. Alterações de conteúdo exigem executar novamente `npm run build`.

## Publicar artigos

Crie um JSON em `content/articles/`, seguindo os exemplos existentes:

```json
{
  "slug": "titulo-do-artigo",
  "title": "Título do artigo",
  "category": "Gestão tributária",
  "excerpt": "Breve apresentação.",
  "readTime": "3 min",
  "published": true,
  "sections": [
    { "heading": "Subtítulo", "paragraphs": ["Primeiro parágrafo.", "Segundo parágrafo."] }
  ]
}
```

`published: false` mantém um texto fora do site. `featured: true` destaca o artigo. Use um slug único, com letras minúsculas e hífens. Após editar, execute o build, a conferência e um novo deploy. Nesta versão o conteúdo é editado nos arquivos ou enviado ao responsável pelo site; ainda não existe painel editorial online.

## Publicação de testes

Projeto Vercel: `fs-site-preview`, equipe `holy-devops`.

```sh
vercel deploy --yes --scope holy-devops
```

- Navy: `/?tema=navy`
- Dark: `/dark/?tema=dark`

Preview com `noindex` no HTML, cabeçalho X-Robots-Tag e robots.txt. O domínio original e o WordPress permanecem separados deste projeto. Credenciais locais e backups não entram no deploy.

## Fontes e materiais

- Referência visual: https://grupovillela.com.br/ (organização orientada a soluções; identidade e textos próprios da FS).
- Logo e foto original: https://www.fssolucoestributarias.com.br/.
- Biografia, cinco descrições bibliográficas e URLs de mídia: fornecidas pelo responsável pelo projeto.
- Mídia: títulos e links informados pelo usuário; os textos completos dos veículos não foram reproduzidos. Conteúdos patrocinados estão identificados como conteúdo de marca.
- Capas: imagens das páginas dos cinco títulos na Amazon, conferidas durante a montagem.
- Correspondência conferida: B0G4K7JNWQ (Compensação), B0H1MTPV54 (Controle), B0H4W1S9VN (Supremacia), B0HF1NKPWL (Manual), B0H7Y9TKQT (Nova Ordem).
- Os dados de editora/ISBN fornecidos referem-se à edição apresentada pela FS; a Amazon mostra dados de edição diferentes para o primeiro título. Essa distinção consta na página da obra.
- Fontes locais: Manrope e Cormorant Garamond, Google Fonts.

## Tratamento da foto

Imagem original preservada em `public/assets/fernando-escritorio.jpg`.
Arquivo da hero: `public/assets/fernando-hero.png` (1239 × 1269, PNG com alpha).
Ferramenta utilizada: image_gen integrada, uma única edição para remoção do fundo.

Prompt: “Use case: background-extraction. Asset type: transparent portrait cutout for a navy and gold professional website hero. Remove only the entire background, wall, all logo and lettering, chair, and tabletop. Keep the exact photographed man: face, identity, hair, glasses, gaze, expression, beard, skin texture, head shape, pose, both hands and fingers, ring, bracelet, navy suit, shirt, light blue tie and pocket square unchanged. Preserve lighting and photographic realism. Retain visible torso, arms and both hands, with transparent margin around the hair. True alpha PNG. No new identity, retouching, pose change, added props, text, glow or border.”

## Verificações realizadas

- Build das 14 páginas e página 404.
- Rotas internas, âncoras, arquivos locais, um H1 por página e links externos.
- Integridade básica dos arquivos de imagem e fontes.
- Sintaxe JavaScript.
- Resposta HTTP da prévia local.

## Endereços publicados

- Navy: https://fs-site-preview.vercel.app/?tema=navy
- Dark: https://fs-site-preview.vercel.app/dark/?tema=dark
- Deployment inicial: https://fs-site-preview-ow0gxfbgs-holy-devops.vercel.app

O primeiro deploy foi automaticamente classificado pela Vercel como produção do projeto de testes. O domínio comercial da FS não foi associado. Os próximos comandos sem --prod geram previews.

## Atualização — mídia e perfil

- Fotografias originais das seis matérias em `public/assets/midia-*.jpg`; a origem de cada imagem está registrada em `content/media.json`.
- Perfil e formação acadêmica em `content/profile.json`, com informações fornecidas pela FS.
- Tipografia da interface: System UI. As identificações tipográficas dos veículos mantêm seu tratamento visual.
- Apresentação e assinatura da marca atualizadas para Assessoria Tributária.

## Nossa Estrutura e Contato

- Quatro fotos selecionadas de `../Estrutura`: IMG_2813 (reuniões), IMG_2819 (recepção), IMG_2805 (fachada) e IMG_2786 (café). Descartados da seleção os ângulos semelhantes da recepção e os enquadramentos menos amplos. Os originais permanecem intactos.
- Tratamento de iluminação, equilíbrio de cores e perspectiva via ferramenta imagegen, seguido de exportação JPEG para web. Galeria na home em `#estrutura`; conteúdo em `content/structure.json`.
- `/contato/` contém nome, e-mail, WhatsApp, estado, empresa, CNPJ e mensagem. CNPJ numérico e alfanumérico são aceitos, com validação de dígitos verificadores.
- `api/contact.js` é uma Vercel Function. Requer `RESEND_API_KEY`, `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL` (remetente verificado no Resend). Sem configuração, retorna indisponibilidade e nunca confirma um envio inexistente.
- O formulário não inclui um selo de reCAPTCHA fictício. Há validação no servidor, limite de payload, honeypot, checagem de origem e idempotência no provedor. Antes de liberar captação pública em escala, configurar proteção antispam gerenciada conforme o provedor escolhido.
- Nenhum dado do formulário é salvo em localStorage ou registrado no console.

## Dados de contato confirmados pela FS

Dados centralizados em `content/contact.json`. Destinatário do formulário: fernandonavesadv@gmail.com. Integração Resend Free solicitada para `envio.fssolucoestributarias.com.br`, região `sa-east-1`; instalação pendente do aceite dos termos na Vercel, seguido da verificação do subdomínio remetente.

## Indicadores de autoridade

`content/authority.json` contém os números fornecidos pela FS nas capturas de referência: R$ 50 milhões+ recuperados, 500+ empresas atendidas, 95% de sucesso e 10+ anos de experiência. Utilizada a contagem de 500+ da faixa consolidada, evitando exibir simultaneamente a contagem anterior de 250+ clientes.

## Fundo da hero

A foto tratada da sala de reuniões (`estrutura-reunioes.jpg`) também compõe o fundo da hero. Camada azul suave com degradê mais intenso sob o texto; variante Dark com contraste mais profundo. O retrato de Fernándo permanece em primeiro plano.

## Hero integrada ao menu

Retrato e cartão de Fernándo removidos exclusivamente da hero. Na home Navy e Dark, o cabeçalho fica sobre a mesma imagem contínua da sala de reuniões, com overlay mais escuro. Nas páginas internas o cabeçalho mantém o fundo próprio.
