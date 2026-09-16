const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
function syncTheme(){const theme=document.documentElement.dataset.theme;document.querySelectorAll('[data-theme-value]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeValue===theme)));document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#080b0f':'#091b32');}
document.querySelectorAll('[data-theme-value]').forEach(button=>button.addEventListener('click',()=>{const theme=button.dataset.themeValue;document.documentElement.dataset.theme=theme;try{sessionStorage.setItem('fs-theme',theme)}catch{}const url=new URL(location.href);url.searchParams.set('tema',theme);history.replaceState(null,'',url);syncTheme();}));syncTheme();
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.filter;let count=0;document.querySelectorAll('.article-card').forEach(card=>{card.hidden=category!=='Todos'&&card.dataset.category!==category;if(!card.hidden)count++;});document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});const status=document.querySelector('#filter-status');if(status)status.textContent=`${count} ${count===1?'artigo encontrado':'artigos encontrados'}.`;const empty=document.querySelector('.filter-empty');if(empty)empty.hidden=count!==0;}));
document.querySelector('#share-article')?.addEventListener('click',async()=>{const status=document.querySelector('#share-status');try{await navigator.clipboard.writeText(location.href);status.textContent='Link copiado.';}catch{status.textContent='Copie o endereço desta página na barra do navegador.';}});

const structureImage = document.querySelector('#structure-image');
const structureCaption = document.querySelector('#structure-caption');
const structureButtons = document.querySelectorAll('[data-structure-image]');
structureButtons.forEach(button => button.addEventListener('click', () => {
  if (!structureImage || !structureCaption) return;
  structureImage.src = button.dataset.structureImage;
  structureImage.alt = button.dataset.structureAlt;
  structureCaption.textContent = button.dataset.structureTitle;
  structureButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
const pressWindow = document.querySelector('.press-window');
const pressToggle = document.querySelector('.press-toggle');
if (pressWindow && pressToggle) {
  pressWindow.classList.add('is-animated');
  pressToggle.hidden = false;
  pressToggle.addEventListener('click', () => {
    const paused = pressWindow.classList.toggle('is-paused');
    pressToggle.setAttribute('aria-pressed', String(paused));
    pressToggle.textContent = paused ? 'Reproduzir' : 'Pausar';
  });
}
