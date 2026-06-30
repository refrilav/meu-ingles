// Motor do leitor interativo - usado por todos os textos do site
// Cada página de texto define DICTIONARY e PARAGRAPHS, depois chama renderReader()

function tokenize(text) {
  return text.match(/[a-zA-Z''-]+(?:-[a-zA-Z''-]+)*|[.,!?;:()"]|—|\s+/g) || [];
}

function getKey(raw) {
  return raw.toLowerCase().replace(/[.,!?;:()"']/g, '').trim();
}

function getSeenData(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveSeenData(storageKey, data) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (e) {}
}

function opacityFor(count) {
  if (!count) return 1;
  if (count === 1) return 0.82;
  if (count <= 3) return 0.62;
  return 0.38;
}

function renderReader(config) {
  const { storageKey, dictionary, paragraphs, containerId, statsId } = config;
  const container = document.getElementById(containerId);
  const statsEl = document.getElementById(statsId);
  let seen = getSeenData(storageKey);
  let activeId = null;
  let wordCounter = 0;

  function updateStats() {
    const unique = Object.keys(seen).length;
    const total = Object.values(seen).reduce((a, b) => a + b, 0);
    if (statsEl) statsEl.textContent = `${unique} palavras · ${total} cliques`;
  }

  function closeAllTooltips() {
    document.querySelectorAll('.tooltip.show').forEach(t => t.classList.remove('show'));
    document.querySelectorAll('.word.active').forEach(w => w.classList.remove('active'));
    activeId = null;
  }

  function renderWord(token) {
    const isPunct = /^[\s.,!?;:()"—]+$/.test(token);
    if (isPunct) {
      const span = document.createElement('span');
      span.textContent = token;
      return span;
    }

    const key = getKey(token);
    const entry = dictionary[key];
    const wrapper = document.createElement('span');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    wordSpan.textContent = token;
    wordSpan.style.opacity = opacityFor(seen[key]);
    wordSpan.dataset.key = key;

    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';

    const id = 'w' + (wordCounter++);
    wordSpan.dataset.id = id;

    function renderTooltipContent() {
      tooltip.innerHTML = '';
      const main = document.createElement('div');
      main.className = 'tooltip-main';
      main.textContent = entry ? entry.t : 'tradução não cadastrada';
      tooltip.appendChild(main);

      if (entry && entry.n) {
        const note = document.createElement('div');
        note.className = 'tooltip-note';
        note.textContent = entry.n;
        tooltip.appendChild(note);
      }

      const cnt = seen[key] || 0;
      if (cnt > 0) {
        const countEl = document.createElement('div');
        countEl.className = 'tooltip-count';
        countEl.textContent = `vista ${cnt}× antes`;
        tooltip.appendChild(countEl);
      }

      const arrow = document.createElement('span');
      arrow.className = 'tooltip-arrow';
      tooltip.appendChild(arrow);
    }

    wordSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeId === id) {
        closeAllTooltips();
        return;
      }
      closeAllTooltips();
      activeId = id;
      wordSpan.classList.add('active');

      seen[key] = (seen[key] || 0) + 1;
      saveSeenData(storageKey, seen);
      wordSpan.style.opacity = opacityFor(seen[key]);
      updateStats();

      renderTooltipContent();
      tooltip.classList.add('show');
    });

    wrapper.appendChild(wordSpan);
    wrapper.appendChild(tooltip);
    return wrapper;
  }

  function renderInlineText(text) {
    const frag = document.createDocumentFragment();
    tokenize(text).forEach(tok => frag.appendChild(renderWord(tok)));
    return frag;
  }

  paragraphs.forEach(para => {
    let el;
    if (para.type === 'h1') {
      el = document.createElement('h1');
      el.className = 'title';
      el.appendChild(renderInlineText(para.text));
    } else if (para.type === 'h2') {
      el = document.createElement('h2');
      el.className = 'subtitle';
      el.appendChild(renderInlineText(para.text));
    } else if (para.type === 'callout') {
      el = document.createElement('div');
      el.className = 'callout';
      const titleEl = document.createElement('div');
      titleEl.className = 'callout-title';
      titleEl.appendChild(renderInlineText(para.title));
      const textEl = document.createElement('div');
      textEl.className = 'callout-text';
      textEl.appendChild(renderInlineText(para.text));
      el.appendChild(titleEl);
      el.appendChild(textEl);
    } else {
      el = document.createElement('p');
      el.className = 'paragraph';
      el.appendChild(renderInlineText(para.text));
    }
    container.appendChild(el);
  });

  document.body.addEventListener('click', closeAllTooltips);
  updateStats();
}
