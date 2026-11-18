(() => {
  const RESULTS_URL = '/api/career/recommendations';

  const resultsContainer = document.getElementById('career-results');
  const statusMessage = document.getElementById('career-status');
  const emptyState = document.getElementById('career-empty');
  const errorState = document.getElementById('career-error');
  const retryButton = document.getElementById('retry-careers');

  if (!resultsContainer) return;

  function addText(parent, tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value == null ? '' : String(value);
    parent.append(element);
    return element;
  }

  function addList(parent, heading, items) {
    if (!Array.isArray(items) || items.length === 0) return;

    addText(parent, 'h3', '', heading);
    const list = document.createElement('ul');

    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = String(item);
      list.append(li);
    });

    parent.append(list);
  }

  function addLinks(parent, links) {
    if (!Array.isArray(links) || links.length === 0) return;

    const validLinks = links.filter(link => {
      try {
        const url = new URL(link.url);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    });

    if (!validLinks.length) return;

    addText(parent, 'h3', '', 'Explore opportunities');
    const list = document.createElement('ul');

    validLinks.forEach(link => {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.href = new URL(link.url).href;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = String(link.label || 'Learn more');
      li.append(anchor);
      list.append(li);
    });

    parent.append(list);
  }

  function renderMatches(data) {
    const matches = Array.isArray(data) ? data : data.matches || [];
    resultsContainer.replaceChildren();
    errorState.hidden = true;
    emptyState.hidden = matches.length > 0;

    if (!matches.length) {
      statusMessage.textContent = '';
      return;
    }

    matches.forEach(match => {
      const card = document.createElement('section');
      card.className = 'panel career-result-card';

      const matchLabel = match.matchPercent == null
        ? 'CAREER MATCH'
        : `${match.matchPercent}% MATCH`;
      addText(card, 'div', 'eyebrow muted', matchLabel);
      addText(card, 'h2', '', match.title || 'Career option');
      addText(card, 'p', 'panel-copy', match.description || '');

      addList(card, 'Skills needed for this role', match.requiredSkills);
      addList(card, 'Your skill gaps', match.skillGaps);
      addList(card, 'Suggested study order', match.studyTasks);
      addLinks(card, match.links);

      resultsContainer.append(card);
    });

    statusMessage.textContent =
      `${matches.length} career match${matches.length === 1 ? '' : 'es'} found.`;
  }

  async function loadMatches() {
    errorState.hidden = true;
    statusMessage.textContent = 'Loading your matches…';

    try {
      const response = await fetch(RESULTS_URL, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Career results request failed (${response.status})`);
      }

      renderMatches(await response.json());
    } catch (error) {
      console.error('Could not load career matches:', error);
      statusMessage.textContent = '';
      errorState.hidden = false;
    }
  }

  retryButton?.addEventListener('click', loadMatches);
  loadMatches();
})();