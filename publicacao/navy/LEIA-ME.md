# FS — versão Navy para cPanel

Gerado em 2026-09-15T19:31:34.734Z.

- Conteúdo publicável: pasta public_html, incluindo .htaccess.
- Tema Navy fixo; 23 páginas, além da 404.
- Domínio: https://www.fssolucoestributarias.com.br.
- Google Maps abre em modal no rodapé.
- Indexação habilitada e sitemap incluído nesta exportação.
- O projeto Vercel mantém as versões de teste separadas.

## Formulário

Copiar fs-contact-config.example.php para /home/fssolucoestribut/fs-contact-config.php, fora da pasta pública, e configurar o envio após validar o transporte de e-mail da hospedagem. O envio fica desativado enquanto enabled=false. api/contact.php exige PHP 8 ou superior. Não publicar o arquivo de configuração na pasta pública.

## Troca e retorno

Confirmar backup local íntegro dos arquivos e banco antes da troca. Preservar a instalação WordPress anterior fora da pasta pública. Não mesclar as regras do WordPress com o novo .htaccess. Testar HTTPS, rotas, modal, formulário e página 404 após instalar. Para retornar, restaurar a pasta e configuração anteriores; o banco original não deve ser removido.
