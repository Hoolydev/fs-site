(() => {
  const section = document.querySelector('#diagnostico');
  if (!section) return;
  const buttons = [...section.querySelectorAll('[data-dx-step]')];
  const panels = [...section.querySelectorAll('[data-dx-panel]')];
  const phones = [...section.querySelectorAll('[data-dx-phone]')];
  const pause = section.querySelector('.dx-pause');
  const counter = section.querySelector('.dx-counter');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, paused = reduced.matches, visible = false, timer;
  function show(next) {
    if (next === active) return;
    active = next;
    panels.forEach((panel, i) => {
      const position = (i - active + panels.length) % panels.length;
      panel.dataset.position = String(position);
      panel.setAttribute('aria-hidden', String(position !== 0));
      panel.classList.toggle('is-entering', position === 0);
    });
    phones.forEach((phone, i) => phone.setAttribute('aria-hidden', String(i !== active)));
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
  }
  function schedule() {
    clearTimeout(timer);
    const playing = !paused && visible && !document.hidden;
    section.classList.toggle('is-playing', playing);
    if (playing) timer = setTimeout(() => { show((active + 1) % panels.length); schedule(); }, 6000);
  }
  function updatePause() {
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Reproduzir animação' : 'Pausar animação';
    schedule();
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => { show(i); schedule(); }));
  pause.hidden = false;
  pause.addEventListener('click', () => { paused = !paused; updatePause(); });
  // Observe the devices instead of the entire section so autoplay also starts on small screens.
  new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); schedule(); }, { threshold: .1 }).observe(section.querySelector('.dx-showcase'));
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { paused = reduced.matches; updatePause(); });
  updatePause();
})();
