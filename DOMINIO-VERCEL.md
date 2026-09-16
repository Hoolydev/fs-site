# Domínio da FS na Vercel

Preparado em 15/09/2026. Projeto `fs-site-preview`, equipe `holy-devops`.

Os domínios `fssolucoestributarias.com.br` e `www.fssolucoestributarias.com.br` já estão vinculados ao projeto. A verificação da Vercel confirmou a propriedade, mas aguarda a configuração de DNS.

## Registros recomendados pela Vercel

O DNS está na Cloudflare. Atualizar os registros web correspondentes:

| Tipo | Nome | Destino | Proxy |
| --- | --- | --- | --- |
| CNAME | @ | 7a3194b6dc560f90.vercel-dns-017.com | Somente DNS |
| CNAME | www | 7a3194b6dc560f90.vercel-dns-017.com | Somente DNS |

Substituir os registros A/AAAA/CNAME que conflitem nesses dois nomes. Manter os servidores DNS da Cloudflare e os registros MX/TXT e subdomínios utilizados por e-mail e cPanel. Nenhum registro DNS foi alterado por esta preparação.

## Publicação

- Versão Navy fixa: https://fs-site-preview.vercel.app/
- Deployment: https://fs-site-preview-8ubktyuc7-holy-devops.vercel.app
- Modal do mapa no rodapé e seis ambientes na galeria, incluindo Igor e Jean.
- Canonical e sitemap apontam para https://www.fssolucoestributarias.com.br.
- Os endereços vercel.app continuam com cabeçalho noindex.
- Arquivos do site antigo no cPanel preservados.
- O formulário ainda aguarda a configuração do serviço de envio de e-mail na Vercel.

Após alterar o DNS, verificar ambos os domínios na Vercel e confirmar HTTPS, página inicial, imagens, mapa e rotas internas no domínio final.
