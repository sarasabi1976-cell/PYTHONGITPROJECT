// GET /api/assessment/options
// { roles:[{id,label}], levels:[{id,label}], skills:[{id,label}] }
// POST /api/assessment/start
// { roleId, levelId, skillIds:[...] } -> { nextUrl?: "practice.html" }

const ASSESSMENT_OPTIONS_ENDPOINT = '/api/assessment/options';
const ASSESSMENT_START_ENDPOINT = '/api/assessment/start';

const assessmentSelection = { roleId: null, levelId: null, skillIds: new Set() };
const assessmentForm = document.getElementById('assessment-form');
const assessmentStatus = document.getElementById('assessment-status');
const startButton = document.getElementById('start-assessment');

function optionId(option) {
  return String(option.id ?? option.value ?? '');
}

function optionLabel(option) {
  return String(option.label ?? option.name ?? option.title ?? option.id ?? '');
}

function renderOptions(containerId, options, group, multi = false) {
  const container = document.getElementById(containerId);
  container.replaceChildren();

  if (!Array.isArray(options) || options.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'panel-copy';
    empty.textContent = 'No options are available right now.';
    container.append(empty);
    return;
  }

  options.forEach(option => {
    const id = optionId(option);
    const label = optionLabel(option);
    if (!id || !label) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = group === 'skills' ? 'chip' : 'choice';
    button.textContent = label;
    button.dataset.group = group;
    button.dataset.optionId = id;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', label);
    if (multi) button.dataset.multi = 'true';
    container.append(button);
  });
}

function updateSubmitState() {
  startButton.disabled = !(assessmentSelection.roleId && assessmentSelection.levelId && assessmentSelection.skillIds.size);
}

function setSelection(button) {
  const { group, optionId: id } = button.dataset;
  if (group === 'skills') {
    if (assessmentSelection.skillIds.has(id)) assessmentSelection.skillIds.delete(id);
    else assessmentSelection.skillIds.add(id);
    button.classList.toggle('selected', assessmentSelection.skillIds.has(id));
  } else {
    const container = button.parentElement;
    container.querySelectorAll('button[data-group]').forEach(option => {
      option.classList.remove('selected');
      option.setAttribute('aria-pressed', 'false');
    });
    if (group === 'roles') assessmentSelection.roleId = id;
    if (group === 'levels') assessmentSelection.levelId = id;
    button.classList.add('selected');
  }
  button.setAttribute('aria-pressed', button.classList.contains('selected') ? 'true' : 'false');
  assessmentStatus.textContent = '';
  updateSubmitState();
}

async function loadAssessmentOptions() {
  assessmentStatus.textContent = 'Loading assessment choices…';
  startButton.disabled = true;
  try {
    const response = await fetch(ASSESSMENT_OPTIONS_ENDPOINT, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Options request failed (${response.status})`);
    const options = await response.json();
    renderOptions('role-options', options.roles, 'roles');
    renderOptions('level-options', options.levels, 'levels');
    renderOptions('skill-options', options.skills, 'skills', true);
    assessmentStatus.textContent = 'Choose a role, experience level, and at least one skill area.';
  } catch (error) {
    console.error('Unable to load assessment options:', error);
    ['role-options', 'level-options', 'skill-options'].forEach(id => {
      const container = document.getElementById(id);
      container.replaceChildren();
      const message = document.createElement('span');
      message.className = 'panel-copy';
      message.textContent = 'Options could not be loaded.';
      container.append(message);
    });
    assessmentStatus.textContent = 'Connect the assessment options endpoint, then try again.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'choice';
    retry.textContent = 'Retry loading options';
    retry.addEventListener('click', loadAssessmentOptions);
    document.getElementById('skill-options').append(retry);
  }
}

document.addEventListener('click', event => {
  const option = event.target.closest('#role-options button[data-group], #level-options button[data-group], #skill-options button[data-group]');
  if (option) setSelection(option);
});

assessmentForm.addEventListener('submit', async event => {
  event.preventDefault();
  updateSubmitState();
  if (startButton.disabled) {
    assessmentStatus.textContent = 'Select a role, experience level, and at least one skill area to continue.';
    return;
  }

  startButton.disabled = true;
  assessmentStatus.textContent = 'Starting your skill scan…';
  try {
    const response = await fetch(ASSESSMENT_START_ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        roleId: assessmentSelection.roleId,
        levelId: assessmentSelection.levelId,
        skillIds: [...assessmentSelection.skillIds]
      })
    });
    if (!response.ok) throw new Error(`Assessment start failed (${response.status})`);
    const result = await response.json().catch(() => ({}));
    let nextUrl = new URL('practice.html', window.location.href);
    if (typeof result.nextUrl === 'string') {
      const candidate = new URL(result.nextUrl, window.location.href);
      if (candidate.origin === window.location.origin) nextUrl = candidate;
    }
    window.location.href = nextUrl.href;
  } catch (error) {
    console.error('Unable to start assessment:', error);
    assessmentStatus.textContent = 'Your selections are ready, but the backend could not start the assessment. Please try again.';
    startButton.disabled = false;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const today = document.getElementById('today');
  if (today) today.textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
  loadAssessmentOptions();
});