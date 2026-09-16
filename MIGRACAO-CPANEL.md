# Publicação da FS na Vercel

## Decisão atual — 15/09/2026

O responsável optou por manter o WordPress no cPanel e migrar somente o domínio do novo site para a Vercel. A migração de arquivos para cPanel foi cancelada. Nenhum arquivo do WordPress foi substituído.

## Backups

- Dois dumps SQL foram baixados em `backup/2026-09-15/` e descompactados para conferência: 12 e 32 tabelas WordPress.
- Os downloads dos arquivos completos ficaram incompletos, identificados com extensão `.incompleto`. Não representam um backup local restaurável.
- O cPanel concluiu o backup `backup-9.15.2026_16-28-54_fssolucoestribut.tar.gz`, preservado no servidor.
- Não foi executada restauração de teste.

## Versão definitiva

- Projeto ativo: `site/`, Vercel `fs-site-preview`.
- Build de produção `FS_SITE_MODE=production npm run build`: Navy fixo, sem seletor Dark, canonical e sitemap para `https://www.fssolucoestributarias.com.br`.
- Modal Google Maps no rodapé, com o link fornecido pelo responsável.
- Galeria com seis ambientes, incluindo Escritório Igor e Escritório Jean.
- Materiais locais `publicacao/navy/` e `site/cpanel/` são uma preparação de cPanel cancelada. Não publicar esses arquivos; o endpoint ativo da Vercel continua em `site/api/contact.js`.
- O envio de formulário na Vercel ainda depende da configuração do Resend. WhatsApp permanece disponível.

## Domínio

Conectar o domínio à Vercel e alterar apenas os registros web indicados por ela. Preservar MX/TXT e os hosts de e-mail/cPanel para manter os serviços da hospedagem anterior.
