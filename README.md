# FS Soluções Tributárias

Site institucional da FS Soluções Tributárias, publicado na Vercel.

- **Site:** https://fs-site-preview.vercel.app/
- **Diagnóstico:** https://fs-site-preview.vercel.app/diagnostico/
- **Projeto:** `site/`

## Estrutura da pasta

- `site/`: código-fonte, conteúdo, imagens utilizadas, testes e configuração da Vercel.
- `Estrutura/`: fotografias originais do escritório.
- `referencias/site-atual/`: referências públicas do site anterior.
- `publicacao/navy/`: exportação histórica para cPanel; essa migração foi cancelada. A versão atual é gerada a partir de `site/`.
- `DOMINIO-VERCEL.md` e `MIGRACAO-CPANEL.md`: registros da preparação de domínio e hospedagem.

## Executar localmente

Requer Node.js 22 ou superior.

```sh
cd site
npm ci
npm run dev
```

Abra http://localhost:4173. Após alterar os arquivos, execute novamente o build para atualizar a prévia.

```sh
npm run build
npm run check
npm test
npm run typecheck
```

## Publicação na Vercel

Ao importar este repositório, configure **Root Directory: `site`**. O arquivo `site/vercel.json` define o build de produção e a saída em `dist/`.

O chat de diagnóstico usa perguntas predefinidas, validação de dados, revisão e consentimento. Após cada nova resposta, mostra o indicador de digitação por dois segundos. A integração com o funil é configurada no servidor: consulte [o contrato do webhook](site/scripts/DIAGNOSTICO-WEBHOOK.md).

Credenciais, arquivos `.env`, vínculo local da Vercel, dependências instaladas, arquivos gerados de build e backups do WordPress ficam fora do Git. Configure as variáveis no ambiente de desenvolvimento ou na Vercel.
