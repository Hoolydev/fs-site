export const diagnosticPage = `<section class="diagnostic-request container">
<a class="breadcrumb" href="/">Início <span>/</span> Diagnóstico tributário</a>
<div class="diagnostic-request-grid">
  <aside class="diagnostic-request-intro">
    <p class="eyebrow">UM PRIMEIRO PASSO. NOVAS POSSIBILIDADES.</p>
    <h1>Vamos conhecer<br><em>sua empresa.</em></h1>
    <p>Uma conversa para entender seu momento e orientar os próximos passos.</p>
    <div class="diagnostic-request-person"><img src="/assets/fernando-diagnostico-recorte.png" alt="Fernándo Silva, sócio-proprietário da FS" width="941" height="1672" decoding="async"><div><strong>Fernándo Silva</strong><span>Especialista em Direito Tributário<br>Sócio-proprietário da FS</span></div></div>
    <p class="diagnostic-request-note">A análise tributária será feita pela nossa equipe, com os documentos e as autorizações necessários.</p>
  </aside>
  <div class="diagnostic-conversation">
    <div class="diagnostic-conversation-header"><span class="diagnostic-monogram" aria-hidden="true">FS</span><div><strong>Seu diagnóstico tributário</strong><span>Atendimento inicial</span></div><span class="diagnostic-duration">Cerca de 2 minutos</span></div>
    <div id="diagnostic-chat" hidden>
      <div class="diagnostic-progress-meta"><span id="diagnostic-stage">Sua empresa</span><span id="diagnostic-count"></span></div>
      <progress id="diagnostic-progress" max="10" value="0" aria-label="Progresso das respostas"></progress>
      <div id="diagnostic-messages" class="diagnostic-messages" role="log" aria-label="Conversa com a FS" aria-live="off"></div>
      <form id="diagnostic-form" novalidate>
        <div class="form-trap" aria-hidden="true"><label for="diagnostic-website">Deixe este campo vazio</label><input id="diagnostic-website" name="website" tabindex="-1" autocomplete="off"></div>
        <div id="diagnostic-step"></div>
        <p id="diagnostic-status" role="status" aria-live="polite"></p>
        <div class="diagnostic-controls"><button type="button" id="diagnostic-back">Voltar</button><button type="button" id="diagnostic-skip" hidden>Pular por enquanto</button><button type="submit" class="button gold" id="diagnostic-submit">Continuar</button></div>
      </form>
      <section id="diagnostic-result" class="diagnostic-result" tabindex="-1" aria-labelledby="diagnostic-result-title" hidden><h2 id="diagnostic-result-title"></h2><p id="diagnostic-result-text"></p><a class="button gold" id="diagnostic-whatsapp" hidden>Continuar no WhatsApp</a></section>
      <div class="diagnostic-conversation-footer"><span>Você pode revisar suas respostas antes de concluir.</span></div>
    </div>
    <p id="diagnostic-loading" class="diagnostic-loading">Preparando seu atendimento…</p>
    <noscript><p class="diagnostic-loading">Ative o JavaScript para iniciar ou <a href="https://wa.me/5562992446000" rel="noopener noreferrer">converse com a FS pelo WhatsApp</a>.</p><style>#diagnostic-loading{display:none}</style></noscript>
  </div>
</div></section>`;
