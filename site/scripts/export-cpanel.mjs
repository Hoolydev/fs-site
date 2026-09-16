import {cp, mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

execFileSync(process.execPath, ['scripts/build.mjs'], {stdio:'inherit'});
const root = path.resolve('../publicacao/navy');
const web = path.join(root, 'public_html');
const domain = 'https://www.fssolucoestributarias.com.br';
await mkdir(web, {recursive:true});
await cp('dist', web, {recursive:true, filter:source=>!/^dist\/(dark(?:\/|$)|routes\.json$)/.test(source)});
const routes = JSON.parse(await readFile('dist/routes.json', 'utf8')).filter(route=>route!=='/dark/');
for (const route of [...routes, '/404.html']) {
  const file = path.join(web, route==='/'?'index.html':route.endsWith('.html')?route.slice(1):route.slice(1)+'index.html');
  let html = await readFile(file, 'utf8');
  html = html.replace(/<script>try\{var t=new URLSearchParams[\s\S]*?<\/script>/, '')
    .replace(/<div class="theme-switch"[\s\S]*?<\/div>/, '')
    .replace('data-theme="dark"','data-theme="navy"')
    .replace('action="/api/contact"', 'action="/api/contact.php"');
  if (route!=='/404.html') html = html.replace('<meta name="robots" content="noindex,nofollow">', `<meta name="robots" content="index,follow"><link rel="canonical" href="${domain}${route}"><meta property="og:url" content="${domain}${route}">`);
  await writeFile(file, html);
}
let contact = await readFile(path.join(web,'contact.js'),'utf8');
contact = contact.replaceAll("'/api/contact'", "'/api/contact.php'");
await writeFile(path.join(web,'contact.js'),contact);
await mkdir(path.join(web,'api'),{recursive:true});
await cp('cpanel/contact.php',path.join(web,'api/contact.php'));
await cp('cpanel/fs-contact-config.example.php',path.join(root,'fs-contact-config.example.php'));
await writeFile(path.join(web,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${domain}/sitemap.xml\n`);
await writeFile(path.join(web,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${domain}${route}</loc></url>`).join('')}</urlset>\n`);
await writeFile(path.join(web,'.htaccess'),`Options -Indexes\nDirectoryIndex index.html\nErrorDocument 404 /404.html\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteCond %{HTTPS} !=on [OR]\nRewriteCond %{HTTP_HOST} !^www\\.fssolucoestributarias\\.com\\.br$ [NC]\nRewriteRule ^ https://www.fssolucoestributarias.com.br%{REQUEST_URI} [R=301,L]\nRewriteRule ^dark/?$ / [R=301,L]\n</IfModule>\n<IfModule mod_headers.c>\nHeader always set X-Content-Type-Options "nosniff"\nHeader always set Referrer-Policy "strict-origin-when-cross-origin"\n<FilesMatch "\\.html$">\nHeader set Cache-Control "no-cache"\n</FilesMatch>\n</IfModule>\n`);
await writeFile(path.join(root,'LEIA-ME.md'),`# FS — versão Navy para cPanel\n\nGerado em ${new Date().toISOString()}.\n\n- Conteúdo publicável: pasta public_html, incluindo .htaccess.\n- Tema Navy fixo; ${routes.length} páginas, além da 404.\n- Domínio: ${domain}.\n- Google Maps abre em modal no rodapé.\n- Indexação habilitada e sitemap incluído nesta exportação.\n- O projeto Vercel mantém as versões de teste separadas.\n\n## Formulário\n\nCopiar fs-contact-config.example.php para /home/fssolucoestribut/fs-contact-config.php, fora da pasta pública, e configurar o envio após validar o transporte de e-mail da hospedagem. O envio fica desativado enquanto enabled=false. api/contact.php exige PHP 8 ou superior. Não publicar o arquivo de configuração na pasta pública.\n\n## Troca e retorno\n\nConfirmar backup local íntegro dos arquivos e banco antes da troca. Preservar a instalação WordPress anterior fora da pasta pública. Não mesclar as regras do WordPress com o novo .htaccess. Testar HTTPS, rotas, modal, formulário e página 404 após instalar. Para retornar, restaurar a pasta e configuração anteriores; o banco original não deve ser removido.\n`);
console.log(`Exportação Navy: ${root}`);
