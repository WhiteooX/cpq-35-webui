import {
  CPQ_ITEMS,
  CPQ_SCORING,
  CPQ_STAGES,
  CPQ_VERSION,
  inspectAnswers,
  scoreDyad
} from './cpq-model.mjs';
import { generateNumericPin } from './security-utils.mjs';
import { computeCommunicationStrain, evaluateDivorceProbability } from './relationship-research.mjs';
import {
  DCI_SCORE_FIELDS,
  CSI_32_ITEMS,
  CSI_32_VERSION,
  ECR_R_ITEMS,
  ECR_R_VERSION,
  GMSEX_ITEMS,
  GMSEX_VERSION,
  KOS_FACTOR_LABELS,
  KOS_ITEMS,
  KOS_VERSION,
  NSSS_S_ITEMS,
  NSSS_S_VERSION,
  PROMIS_SEXFS_COMMON_ITEMS,
  PROMIS_SEXFS_PROFILE_ITEMS,
  PROMIS_SEXFS_PROFILES,
  PROMIS_SEXFS_REASON_OPTIONS,
  PROMIS_SEXFS_VERSION,
  RFS_ITEMS,
  RFS_VERSION,
  blankDciScores,
  blankEcrAnswers,
  blankPromisSexFsResponse,
  blankScaleAnswers,
  inspectEcrAnswers,
  inspectScaleAnswers,
  inspectPromisSexFs,
  scoreAuthorizedDci,
  scoreCsi32,
  scoreEcrR,
  scoreGmsex,
  scoreKos,
  scoreNsssS,
  scorePromisSexFs,
  scoreRfs,
  validateDciItemBank,
  validateDciScores
} from './supplemental-model.mjs';
import {
  LONGITUDINAL_SCHEMA,
  buildLongitudinalDataset,
  summarizeChange
} from './longitudinal-model.mjs';
import { callCloudRpc, inspectCloudConfig, probeCloudService } from './cloud-session.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const blankAnswers = () => Array(35).fill(null);
const cfg = window.CPQ_SUPABASE || {};
const inspectedCloudConfig = inspectCloudConfig(cfg);
const divorceModelConfig = window.CPQ_DIVORCE_MODEL || null;
const dciItemBank = window.CPQ_DCI_ITEM_BANK || null;

const AFFECT_CODES = Object.freeze({
  positive: { label: '积极情感', detail: '温暖、关爱或愉悦' },
  interest: { label: '兴趣／好奇', detail: '倾听、澄清或询问' },
  neutral: { label: '中性', detail: '无明显正负情感' },
  internal: { label: '内化负向', detail: '受伤、紧张、恐惧或退缩' },
  external: { label: '外化负向', detail: '愤怒、否定或蔑视' }
});

const SPAFF_INFORMED_DIMENSIONS = Object.freeze({
  contempt: { label: '蔑视', detail: '贬低、嘲讽或优越姿态', tone: 'negative' },
  domineeringBelligerence: { label: '支配／挑衅', detail: '控制、好战或挑衅表达', tone: 'negative' },
  annoyanceFrustration: { label: '恼怒／挫败', detail: '烦躁、不耐或受挫', tone: 'negative' },
  conflictLevel: { label: '总体冲突强度', detail: '整段互动的对抗程度', tone: 'negative' },
  affection: { label: '关爱', detail: '温暖、亲近或关爱表达', tone: 'positive' },
  validation: { label: '理解／确认', detail: '理解并接纳伴侣的感受或观点', tone: 'positive' },
  collaboration: { label: '协作', detail: '共同解决问题与配合', tone: 'positive' },
  perspectiveInterest: { label: '关注伴侣视角', detail: '主动了解伴侣的想法与感受', tone: 'positive' },
  lightness: { label: '轻松感', detail: '适度幽默、放松或缓和气氛', tone: 'positive' }
});

const blankSpaffRatings = () => Object.fromEntries(Object.keys(SPAFF_INFORMED_DIMENSIONS).map(code => [code, null]));
const blankDciAnswers = () => Array(37).fill(null);
const relationshipMeasureDefinitions = Object.freeze({
  csi: { items: CSI_32_ITEMS, min: 0, max: 5, score: scoreCsi32, version: CSI_32_VERSION, label: 'CSI-32' },
  gmsex: { items: GMSEX_ITEMS, min: 1, max: 7, score: scoreGmsex, version: GMSEX_VERSION, label: 'GMSEX' },
  nsss: { items: NSSS_S_ITEMS, min: 1, max: 5, score: scoreNsssS, version: NSSS_S_VERSION, label: 'NSSS-S' },
  kos: { items: KOS_ITEMS, min: 1, max: 5, score: scoreKos, version: KOS_VERSION, label: 'KOS-18' },
  rfs: { items: RFS_ITEMS, min: 1, max: 5, score: scoreRfs, version: RFS_VERSION, label: 'RFS-12' }
});

const state = {
  respondent: 'A',
  stage: 'emergence',
  answers: { A: blankAnswers(), B: blankAnswers() },
  submitted: { A: false, B: false },
  session: { mode: 'local', code: null, role: null, token: null, invitePin: null },
  events: [],
  spaffRatings: { A: blankSpaffRatings(), B: blankSpaffRatings() },
  ecrPerson: 'A',
  ecrAnswers: { A: blankEcrAnswers(), B: blankEcrAnswers() },
  ecrSubmitted: { A: false, B: false },
  dciPerson: 'A',
  dciAnswers: { A: blankDciAnswers(), B: blankDciAnswers() },
  dciSubmitted: { A: false, B: false },
  dciScores: { A: blankDciScores(), B: blankDciScores() },
  relationshipMeasures: Object.fromEntries(Object.entries(relationshipMeasureDefinitions).map(([key, definition]) => [key, {
    person: 'A',
    answers: { A: blankScaleAnswers(definition.items.length), B: blankScaleAnswers(definition.items.length) },
    submitted: { A: false, B: false }
  }])),
  promisSexFs: {
    person: 'A',
    responses: { A: blankPromisSexFsResponse(), B: blankPromisSexFsResponse() },
    submitted: { A: false, B: false }
  },
  cloudProgress: {
    cpq: { A: 0, B: 0 },
    ecr: { A: 0, B: 0 },
    dci: { A: 0, B: 0 },
    csi: { A: 0, B: 0 },
    gmsex: { A: 0, B: 0 },
    nsss: { A: 0, B: 0 },
    kos: { A: 0, B: 0 },
    promis: { A: 0, B: 0 },
    rfs: { A: 0, B: 0 }
  },
  cloudPromisRequired: { A: 3, B: 3 },
  importedRecords: []
};

let draftTimer = null;
let cpqDraftRevision = 0;
let cpqSyncedRevision = 0;
let cpqSaveTail = Promise.resolve();
let cpqSaveActive = false;
let cpqSyncError = '';
let cpqSubmitQueued = false;
const supplementalDraftTimers = { ecr: null, dci: null, csi: null, gmsex: null, nsss: null, kos: null, promis: null, rfs: null };
let cloudRefreshInFlight = false;
let cloudAvailability = {
  status: inspectedCloudConfig.valid ? 'checking' : 'unconfigured',
  detail: inspectedCloudConfig.reason
};

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (_) {
    return false;
  }
}

function cloudReady() {
  return cloudAvailability.status === 'online';
}

async function checkCloudAvailability() {
  if (!inspectedCloudConfig.valid) {
    cloudAvailability = { status: 'unconfigured', detail: inspectedCloudConfig.reason };
    renderSession();
    return false;
  }
  cloudAvailability = { status: 'checking', detail: '正在连接远程数据库' };
  renderSession();
  try {
    const status = await probeCloudService(cfg);
    cloudAvailability = {
      status: 'online',
      detail: `远程会话可用 · 数据保留 ${status.sessionRetentionDays} 天`
    };
    renderSession();
    return true;
  } catch (error) {
    cloudAvailability = { status: 'offline', detail: error.message };
    renderSession();
    return false;
  }
}

function setMessage(selector, message) {
  $(selector).textContent = message || '';
}

function activateTab(name) {
  $$('.tab').forEach(button => button.classList.toggle('active', button.dataset.tab === name));
  $$('.panel').forEach(panel => panel.classList.toggle('active', panel.id === name));
  const panel = document.getElementById(name);
  if (panel) panel.focus({ preventScroll: true });
  if (name === 'questionnaire' && cloudReady() && state.session.mode === 'cloud') {
    refreshCloudSession({ silent: true });
  }
}

function setupTabs() {
  $$('.tab').forEach(button => button.addEventListener('click', () => activateTab(button.dataset.tab)));
}

function isLocked(person) {
  return state.submitted[person];
}

function resetAssessment(mode = 'local') {
  state.answers = { A: blankAnswers(), B: blankAnswers() };
  state.submitted = { A: false, B: false };
  state.respondent = 'A';
  state.stage = 'emergence';
  state.events = [];
  state.spaffRatings = { A: blankSpaffRatings(), B: blankSpaffRatings() };
  state.ecrPerson = 'A';
  state.ecrAnswers = { A: blankEcrAnswers(), B: blankEcrAnswers() };
  state.ecrSubmitted = { A: false, B: false };
  state.dciPerson = 'A';
  state.dciAnswers = { A: blankDciAnswers(), B: blankDciAnswers() };
  state.dciSubmitted = { A: false, B: false };
  state.dciScores = { A: blankDciScores(), B: blankDciScores() };
  state.relationshipMeasures = Object.fromEntries(Object.entries(relationshipMeasureDefinitions).map(([key, definition]) => [key, {
    person: 'A',
    answers: { A: blankScaleAnswers(definition.items.length), B: blankScaleAnswers(definition.items.length) },
    submitted: { A: false, B: false }
  }]));
  state.promisSexFs = { person: 'A', responses: { A: blankPromisSexFsResponse(), B: blankPromisSexFsResponse() }, submitted: { A: false, B: false } };
  state.cloudProgress = Object.fromEntries(['cpq', 'ecr', 'dci', 'csi', 'gmsex', 'nsss', 'kos', 'promis', 'rfs'].map(key => [key, { A: 0, B: 0 }]));
  state.cloudPromisRequired = { A: 3, B: 3 };
  clearTimeout(draftTimer);
  draftTimer = null;
  cpqDraftRevision = 0;
  cpqSyncedRevision = 0;
  cpqSaveTail = Promise.resolve();
  cpqSaveActive = false;
  cpqSyncError = '';
  cpqSubmitQueued = false;
  if (mode === 'local') state.session = { mode: 'local', code: null, role: null, token: null, invitePin: null };
  renderAll();
}

function hasCurrentAssessmentData() {
  return Boolean(
    inspectAnswers(state.answers.A).answered || inspectAnswers(state.answers.B).answered ||
    inspectEcrAnswers(state.ecrAnswers.A).answered || inspectEcrAnswers(state.ecrAnswers.B).answered ||
    state.dciAnswers.A.some(Number.isFinite) || state.dciAnswers.B.some(Number.isFinite) ||
    Object.values(state.dciScores).some(scores => Object.values(scores).some(Number.isFinite)) ||
    Object.values(state.relationshipMeasures).some(measure => Object.values(measure.answers).some(answers => answers.some(Number.isFinite))) ||
    Object.values(state.promisSexFs.responses).some(response => Object.values(response.answers).some(Number.isFinite) || response.reasons.length) ||
    state.events.length || Object.values(state.spaffRatings).some(ratings => Object.values(ratings).some(Number.isFinite))
  );
}

function allowedRespondent(person) {
  if (state.session.mode === 'cloud') return person === state.session.role;
  if (!state.submitted.A) return person === 'A';
  if (!state.submitted.B) return person === 'B';
  return person === 'A' || person === 'B';
}

function setRespondent(person) {
  if (!allowedRespondent(person)) {
    const expected = state.session.mode === 'cloud' ? state.session.role : (state.submitted.A ? 'B' : 'A');
    $('#respondentSelect').value = expected;
    setMessage('#questionnaireMessage', `当前流程只能由伴侣 ${expected} 作答。`);
    return;
  }
  state.respondent = person;
  renderQuestions();
}

function renderProgress() {
  for (const person of ['A', 'B']) {
    const localAnswered = inspectAnswers(state.answers[person]).answered;
    const answered = state.session.mode === 'cloud' && person !== state.session.role
      ? state.cloudProgress.cpq[person]
      : localAnswered;
    $(`#progress${person}`).textContent = `${answered}/35${state.submitted[person] ? ' · 已锁定' : ''}`;
  }
  const current = inspectAnswers(state.answers[state.respondent]);
  $('#currentRespondent').textContent = state.respondent;
  $('#currentStage').textContent = CPQ_STAGES[state.stage].zh;
  $('#progressBar').style.width = `${Math.round(current.answered / 35 * 100)}%`;
  renderCpqSyncStatus();
}

function renderCpqSyncStatus() {
  const status = $('#cpqSyncStatus');
  if (!status) return;
  if (state.session.mode !== 'cloud') {
    status.textContent = '本地即时暂存';
    status.dataset.state = 'local';
  } else if (cpqSyncError) {
    status.textContent = '同步失败 · 将自动重试';
    status.dataset.state = 'error';
  } else if (cpqSaveActive) {
    status.textContent = '正在同步云端…';
    status.dataset.state = 'syncing';
  } else if (cpqDraftRevision !== cpqSyncedRevision) {
    status.textContent = '已记录 · 等待同步';
    status.dataset.state = 'pending';
  } else if (state.submitted[state.respondent]) {
    status.textContent = '云端已锁定';
    status.dataset.state = 'locked';
  } else {
    status.textContent = '云端已同步';
    status.dataset.state = 'synced';
  }
}

function makeQuestion(item, locked) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'question question-inner';
  fieldset.disabled = locked;
  const legend = document.createElement('legend');
  const head = document.createElement('div');
  head.className = 'question-head';
  const number = document.createElement('span');
  number.className = 'question-number';
  number.textContent = item.id;
  const wording = document.createElement('span');
  const zh = document.createElement('span');
  zh.className = 'question-zh';
  zh.textContent = item.zh;
  const en = document.createElement('span');
  en.className = 'question-en';
  en.textContent = item.en;
  wording.append(zh, en);
  head.append(number, wording);
  legend.append(head);
  fieldset.append(legend);

  const scale = document.createElement('div');
  scale.className = 'likert';
  scale.setAttribute('role', 'radiogroup');
  for (let value = 1; value <= 9; value += 1) {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `${state.respondent}-q${item.id}`;
    radio.value = String(value);
    radio.checked = state.answers[state.respondent][item.id - 1] === value;
    radio.addEventListener('change', () => {
      state.answers[state.respondent][item.id - 1] = value;
      if (state.session.mode === 'cloud') {
        cpqDraftRevision += 1;
        cpqSyncError = '';
        state.cloudProgress.cpq[state.respondent] = inspectAnswers(state.answers[state.respondent]).answered;
      }
      renderProgress();
      scheduleCloudDraft();
    });
    const text = document.createElement('span');
    text.textContent = String(value);
    label.append(radio, text);
    scale.append(label);
  }
  fieldset.append(scale);
  return fieldset;
}

function renderQuestions() {
  const locked = isLocked(state.respondent);
  const container = $('#questions');
  container.replaceChildren(...CPQ_ITEMS.filter(item => item.stage === state.stage).map(item => makeQuestion(item, locked)));
  $('#respondentSelect').value = state.respondent;
  $('#respondentSelect').disabled = state.session.mode === 'cloud' || (state.session.mode === 'local' && state.submitted.A !== state.submitted.B);
  $('#saveDraftBtn').disabled = locked;
  $('#submitAnswersBtn').disabled = locked || cpqSubmitQueued;
  $('#clearAnswersBtn').disabled = locked;
  $$('.stage').forEach(button => button.classList.toggle('active', button.dataset.stage === state.stage));
  renderProgress();
  if (locked) setMessage('#questionnaireMessage', `伴侣 ${state.respondent} 的答案已提交并锁定。`);
}

function makeEcrQuestion(item, person, locked) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'question question-inner';
  fieldset.disabled = locked;
  const legend = document.createElement('legend');
  const head = document.createElement('div');
  head.className = 'question-head';
  const number = document.createElement('span');
  number.className = 'question-number';
  number.textContent = item.id;
  const wording = document.createElement('span');
  const zh = document.createElement('span');
  zh.className = 'question-zh';
  zh.textContent = item.zh;
  const en = document.createElement('span');
  en.className = 'question-en';
  en.textContent = item.en;
  wording.append(zh, en);
  head.append(number, wording);
  legend.append(head);
  fieldset.append(legend);
  const scale = document.createElement('div');
  scale.className = 'likert seven';
  scale.setAttribute('role', 'radiogroup');
  for (let value = 1; value <= 7; value += 1) {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `ecr-${person}-q${item.id}`;
    radio.value = String(value);
    radio.checked = state.ecrAnswers[person][item.id - 1] === value;
    radio.addEventListener('change', () => {
      state.ecrAnswers[person][item.id - 1] = value;
      renderEcrProgress();
      scheduleSupplementalDraft('ecr');
    });
    const text = document.createElement('span');
    text.textContent = String(value);
    label.append(radio, text);
    scale.append(label);
  }
  fieldset.append(scale);
  return fieldset;
}

function renderEcrProgress() {
  for (const person of ['A', 'B']) {
    const inspection = inspectEcrAnswers(state.ecrAnswers[person]);
    const answered = state.session.mode === 'cloud' && person !== state.session.role
      ? state.cloudProgress.ecr[person]
      : inspection.answered;
    $(`#ecrProgress${person}`).textContent = `${answered}/36${state.ecrSubmitted[person] ? ' · 已锁定' : ''}`;
  }
}

function renderEcrResults() {
  const scores = { A: scoreEcrR(state.ecrAnswers.A), B: scoreEcrR(state.ecrAnswers.B) };
  const ready = state.ecrSubmitted.A && state.ecrSubmitted.B && scores.A.complete && scores.B.complete;
  $('#ecrResults').hidden = !ready;
  if (ready) {
    for (const target of ['A', 'B']) {
      $(`#ecrAnxiety${target}`).textContent = scores[target].anxiety.toFixed(2);
      $(`#ecrAvoidance${target}`).textContent = scores[target].avoidance.toFixed(2);
    }
  }
}

function renderEcr() {
  if (state.session.mode === 'cloud') state.ecrPerson = state.session.role;
  const person = state.ecrPerson;
  const locked = state.ecrSubmitted[person];
  $('#ecrPerson').value = person;
  $('#ecrPerson').disabled = state.session.mode === 'cloud';
  $('#submitEcrBtn').disabled = locked;
  $('#clearEcrBtn').disabled = locked;
  $('#ecrQuestions').replaceChildren(...ECR_R_ITEMS.map(item => makeEcrQuestion(item, person, locked)));
  renderEcrProgress();
  renderEcrResults();
  setMessage('#ecrMessage', locked ? `伴侣 ${person} 的 ECR-R 已提交并锁定。` : '');
}

async function submitEcr() {
  const person = state.ecrPerson;
  const inspection = inspectEcrAnswers(state.ecrAnswers[person]);
  if (!inspection.complete) {
    setMessage('#ecrMessage', inspection.invalid.length ? `存在非法题值：${inspection.invalid.join('、')}。` : `还有 ${inspection.missing.length} 题未完成。`);
    return;
  }
  if (state.session.mode === 'cloud') {
    await saveEcrToCloud(true);
    return;
  }
  state.ecrSubmitted[person] = true;
  if (person === 'A' && !state.ecrSubmitted.B) state.ecrPerson = 'B';
  renderEcr();
  setMessage('#ecrMessage', person === 'A' ? 'A 已提交并锁定；现在请由伴侣 B 独立作答。' : 'B 已提交并锁定；双方 ECR-R 连续维度结果已解锁。');
}

function makeDciQuestion(item, person, locked) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'question question-inner';
  fieldset.disabled = locked;
  const legend = document.createElement('legend');
  const head = document.createElement('span');
  head.className = 'question-head';
  const number = document.createElement('span');
  number.className = 'question-number';
  number.textContent = String(item.id);
  const wording = document.createElement('span');
  const zh = document.createElement('span');
  zh.className = 'question-zh';
  zh.textContent = item.zh || item.text;
  wording.append(zh);
  if (item.zh) {
    const en = document.createElement('span');
    en.className = 'question-en';
    en.textContent = item.text;
    wording.append(en);
  }
  head.append(number, wording);
  legend.append(head);
  fieldset.append(legend);
  const scale = document.createElement('div');
  scale.className = 'likert five';
  scale.setAttribute('role', 'radiogroup');
  for (let value = 1; value <= 5; value += 1) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `dci-${person}-q${item.id}`;
    input.value = String(value);
    input.checked = state.dciAnswers[person][item.id - 1] === value;
    input.addEventListener('change', () => {
      state.dciAnswers[person][item.id - 1] = value;
      renderDciProgress();
      setMessage('#dciMessage', state.session.mode === 'cloud' ? 'DCI 草稿正在云端同步。' : 'DCI 答案暂存在当前页面；提交后锁定。');
      scheduleSupplementalDraft('dci');
    });
    const text = document.createElement('span');
    text.textContent = String(value);
    label.append(input, text);
    scale.append(label);
  }
  fieldset.append(scale);
  return fieldset;
}

function renderDciProgress() {
  for (const person of ['A', 'B']) {
    const localAnswered = state.dciAnswers[person].filter(value => Number.isInteger(value) && value >= 1 && value <= 5).length;
    const answered = state.session.mode === 'cloud' && person !== state.session.role
      ? state.cloudProgress.dci[person]
      : localAnswered;
    $(`#dciProgress${person}`).textContent = `${answered}/37`;
  }
}

function renderDciQuestions(person, locked) {
  const sectionZh = {
    'How you communicate your stress to your partner': '你如何向伴侣传达自己的压力',
    'What your partner does when you are feeling stressed': '当你感到压力时，伴侣会怎么做',
    'How your partner communicates when he/she is feeling stressed': '伴侣如何向你传达自己的压力',
    'What you do when your partner communicates stress': '当伴侣表达压力时，你会怎么做',
    'What you and your partner do when you are both feeling stressed': '当你们双方都有压力时，你们会怎么做',
    'How you evaluate your coping as a couple': '你如何评价你们作为伴侣的共同应对'
  };
  const fragment = document.createDocumentFragment();
  let currentSection = '';
  for (const item of [...dciItemBank.items].sort((a, b) => a.id - b.id)) {
    if (item.section !== currentSection) {
      currentSection = item.section;
      const heading = document.createElement('h4');
      heading.className = 'dci-section-heading';
      const zh = document.createElement('span');
      zh.textContent = sectionZh[item.section] || item.section;
      heading.append(zh);
      if (sectionZh[item.section]) {
        const en = document.createElement('small');
        en.textContent = item.section;
        heading.append(en);
      }
      fragment.append(heading);
    }
    fragment.append(makeDciQuestion(item, person, locked));
  }
  $('#dciQuestions').replaceChildren(fragment);
}

function renderDciTotals() {
  let ready = state.dciSubmitted.A && state.dciSubmitted.B;
  for (const person of ['A', 'B']) {
    const validation = validateDciScores(state.dciScores[person]);
    const total = validation.valid ? validation.scores.totalWithoutEvaluation : null;
    $(`#dciTotal${person}`).textContent = Number.isFinite(total) ? `${total}/175` : '—';
    if (!validation.available || !Number.isFinite(total)) ready = false;
    const breakdown = $(`#dciScores${person}`);
    if (breakdown) {
      breakdown.replaceChildren(...Object.entries(DCI_SCORE_FIELDS)
        .filter(([key]) => key !== 'totalWithoutEvaluation')
        .map(([key, definition]) => {
          const row = document.createElement('li');
          const value = validation.scores[key];
          row.textContent = `${definition.label}：${Number.isFinite(value) ? `${value}/${definition.max}` : '—'}`;
          return row;
        }));
    }
  }
  $('#dciResults').hidden = !ready;
}

function renderDciManualEntry(person) {
  const fields = Object.entries(DCI_SCORE_FIELDS).map(([key, definition]) => {
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = definition.label;
    const input = document.createElement('input');
    input.type = 'number';
    input.min = String(definition.min);
    input.max = String(definition.max);
    input.step = '1';
    input.value = state.dciScores[person][key] ?? '';
    input.disabled = state.dciSubmitted[person];
    input.setAttribute('aria-label', `伴侣 ${person} · ${definition.label}`);
    const help = document.createElement('small');
    help.textContent = `允许范围 ${definition.min}–${definition.max}`;
    input.addEventListener('change', event => {
      const raw = event.target.value;
      state.dciScores[person][key] = raw === '' ? null : Number(raw);
      const validation = validateDciScores(state.dciScores[person]);
      event.target.setAttribute('aria-invalid', String(!validation.valid && validation.invalid.includes(key)));
      setMessage('#dciMessage', validation.valid
        ? (state.session.mode === 'cloud' ? 'DCI 分量表草稿正在云端同步。' : 'DCI 分量表结果已保留在当前页面；下载纵向档案以保存。')
        : `超出允许范围：${validation.invalid.map(field => DCI_SCORE_FIELDS[field].label).join('、')}。`);
      renderDciTotals();
      scheduleSupplementalDraft('dci');
    });
    wrapper.append(label, input, help);
    return wrapper;
  });
  $('#dciScoreGrid').replaceChildren(...fields);
}

function renderDci() {
  if (state.session.mode === 'cloud') state.dciPerson = state.session.role;
  const person = state.dciPerson;
  $('#dciPerson').value = person;
  $('#dciPerson').disabled = state.session.mode === 'cloud';
  const bank = validateDciItemBank(dciItemBank);
  $('#dciQuestions').hidden = !bank.valid;
  $('#dciManualEntry').hidden = bank.valid;
  $('#submitDciBtn').hidden = false;
  $('#submitDciBtn').textContent = bank.valid ? '提交当前 DCI' : '锁定当前 DCI 分数';
  $('#submitDciBtn').disabled = state.dciSubmitted[person];
  $('#clearDciBtn').disabled = state.dciSubmitted[person];
  if (bank.valid) {
    $('#dciStatus').classList.add('warning');
    $('#dciStatus').textContent = `已加载 ${bank.version} 完整 37 题。中文为本项目制作的非官方阅读辅助，未经正式翻译与测量等值性验证；英文原文是版本与计分参照。1 = very rarely，5 = very often。`;
    const locked = state.dciSubmitted[person];
    $('#submitDciBtn').disabled = locked;
    renderDciQuestions(person, locked);
  } else {
    $('#dciStatus').classList.add('warning');
    $('#dciStatus').textContent = '未加载获准部署的 DCI 题库：公开网站仅提供正式分量表结果录入、云端会话同步和纵向保存。';
    renderDciManualEntry(person);
  }
  renderDciProgress();
  renderDciTotals();
}

async function submitDci() {
  const person = state.dciPerson;
  const bank = validateDciItemBank(dciItemBank);
  if (bank.valid) {
    const result = scoreAuthorizedDci(state.dciAnswers[person], dciItemBank);
    if (!result.complete) {
      setMessage('#dciMessage', result.reason);
      return;
    }
    state.dciScores[person] = { ...blankDciScores(), ...result.scores };
  } else {
    const validation = validateDciScores(state.dciScores[person]);
    if (!validation.valid || !validation.available) {
      setMessage('#dciMessage', validation.valid ? '请至少录入一项按正式手册获得的 DCI 分数。' : `超出允许范围：${validation.invalid.map(field => DCI_SCORE_FIELDS[field].label).join('、')}。`);
      return;
    }
  }
  if (state.session.mode === 'cloud') {
    await saveDciToCloud(true);
    return;
  }
  state.dciSubmitted[person] = true;
  if (person === 'A' && !state.dciSubmitted.B) state.dciPerson = 'B';
  renderDci();
  setMessage('#dciMessage', person === 'A' ? 'A 的 DCI 已提交；现在请由伴侣 B 独立作答。' : 'B 的 DCI 已提交；双方结果已保存到当前页面。');
}

function renderSupplements() {
  renderEcr();
  renderDci();
  Object.keys(relationshipMeasureDefinitions).forEach(renderRelationshipMeasure);
  renderPromisSexFs();
}

function scaleEndpoints(measure, item) {
  if (measure === 'gmsex') return item.zh.split(' — ');
  if (measure === 'nsss') return ['完全不满意', '极其满意'];
  if (measure === 'kos') return ['非常不同意', '非常同意'];
  if (measure === 'rfs') return item.response === 'agreement' ? ['非常不同意', '非常同意'] : ['从不', '总是'];
  if (item.kind === 'happiness') return ['极不幸福', '非常完美'];
  if (item.kind === 'agreement') return ['总是不同意', '总是同意'];
  if (item.kind === 'frequency') return ['从不', '一直如此'];
  if (item.kind === 'truth') return ['完全不符合', '完全符合'];
  if (item.kind === 'semantic') return item.zh.split(' — ');
  return ['完全没有', '完全如此'];
}

function makeRelationshipQuestion(measure, item, person, locked) {
  const definition = relationshipMeasureDefinitions[measure];
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'question question-inner';
  fieldset.disabled = locked;
  const legend = document.createElement('legend');
  const head = document.createElement('span');
  head.className = 'question-head';
  const number = document.createElement('span');
  number.className = 'question-number';
  number.textContent = String(item.id);
  const wording = document.createElement('span');
  const zh = document.createElement('span');
  zh.className = 'question-zh';
  zh.textContent = item.zh;
  const en = document.createElement('span');
  en.className = 'question-en';
  en.textContent = item.en;
  wording.append(zh, en);
  head.append(number, wording);
  legend.append(head);
  const endpoints = document.createElement('div');
  endpoints.className = 'scale-endpoints';
  const [low, high] = scaleEndpoints(measure, item);
  endpoints.innerHTML = `<span>${low}</span><span>${high}</span>`;
  const scale = document.createElement('div');
  const itemMin = item.min ?? definition.min;
  const itemMax = item.max ?? definition.max;
  const choiceCount = itemMax - itemMin + 1;
  scale.className = `likert ${choiceCount === 7 ? 'seven' : choiceCount === 6 ? 'six' : choiceCount === 5 ? 'five' : ''}`;
  scale.setAttribute('role', 'radiogroup');
  for (let value = itemMin; value <= itemMax; value += 1) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `${measure}-${person}-q${item.id}`;
    input.value = String(value);
    input.checked = state.relationshipMeasures[measure].answers[person][item.id - 1] === value;
    input.addEventListener('change', () => {
      state.relationshipMeasures[measure].answers[person][item.id - 1] = value;
      renderRelationshipProgress(measure);
      setMessage(`#${measure}Message`, state.session.mode === 'cloud' ? `${definition.label} 草稿正在云端同步。` : `${definition.label} 答案暂存在当前页面；提交后锁定。`);
      scheduleSupplementalDraft(measure);
    });
    const text = document.createElement('span');
    text.textContent = String(value);
    label.append(input, text);
    scale.append(label);
  }
  fieldset.append(legend, endpoints, scale);
  return fieldset;
}

function renderRelationshipProgress(measure) {
  const definition = relationshipMeasureDefinitions[measure];
  const model = state.relationshipMeasures[measure];
  for (const person of ['A', 'B']) {
    const local = inspectScaleAnswers(model.answers[person], definition.items, definition.min, definition.max).answered;
    const answered = state.session.mode === 'cloud' && person !== state.session.role ? state.cloudProgress[measure][person] : local;
    $(`#${measure}Progress${person}`).textContent = `${answered}/${definition.items.length}${model.submitted[person] ? ' · 已锁定' : ''}`;
  }
}

function renderRelationshipResults(measure) {
  const definition = relationshipMeasureDefinitions[measure];
  const model = state.relationshipMeasures[measure];
  const scores = { A: definition.score(model.answers.A), B: definition.score(model.answers.B) };
  const ready = model.submitted.A && model.submitted.B && scores.A.complete && scores.B.complete;
  $(`#${measure}Results`).hidden = !ready;
  if (!ready) return;
  for (const person of ['A', 'B']) {
    const score = scores[person];
    $(`#${measure}Score${person}`).textContent = measure === 'csi'
      ? `${score.total}/161`
      : measure === 'gmsex'
        ? `${score.mean.toFixed(2)}/7`
        : measure === 'kos'
          ? `${score.total}/90（均值 ${score.mean.toFixed(2)}）`
          : `${score.total}/60（均值 ${score.mean.toFixed(2)}）`;
    if (measure === 'kos') {
      const list = $(`#kosFactors${person}`);
      list.replaceChildren(...Object.entries(score.factors).map(([factor, value]) => {
        const item = document.createElement('li');
        item.textContent = `${KOS_FACTOR_LABELS[factor]}：${value.mean.toFixed(2)}/5`;
        return item;
      }));
    }
  }
}

function renderRelationshipMeasure(measure) {
  const definition = relationshipMeasureDefinitions[measure];
  const model = state.relationshipMeasures[measure];
  if (state.session.mode === 'cloud') model.person = state.session.role;
  const person = model.person;
  const locked = model.submitted[person];
  $(`#${measure}Person`).value = person;
  $(`#${measure}Person`).disabled = state.session.mode === 'cloud';
  $(`#submit${measure[0].toUpperCase()}${measure.slice(1)}Btn`).disabled = locked;
  $(`#clear${measure[0].toUpperCase()}${measure.slice(1)}Btn`).disabled = locked;
  $(`#${measure}Questions`).replaceChildren(...definition.items.map(item => makeRelationshipQuestion(measure, item, person, locked)));
  renderRelationshipProgress(measure);
  renderRelationshipResults(measure);
}

function makePromisQuestion(item, response, locked) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'question question-inner promis-question';
  fieldset.disabled = locked;
  const legend = document.createElement('legend');
  const head = document.createElement('span');
  head.className = 'question-head';
  const number = document.createElement('span');
  number.className = 'question-number promis-item-id';
  number.textContent = item.id;
  const wording = document.createElement('span');
  const zh = document.createElement('span');
  zh.className = 'question-zh';
  zh.textContent = item.zh;
  const en = document.createElement('span');
  en.className = 'question-en';
  en.textContent = item.en;
  wording.append(zh, en);
  head.append(number, wording);
  legend.append(head);
  const choices = document.createElement('div');
  choices.className = 'promis-choices';
  item.choices.forEach(option => {
    const label = document.createElement('label');
    label.className = 'promis-choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `promis-${state.promisSexFs.person}-${item.key}`;
    input.value = String(option.value);
    input.checked = response.answers[item.key] === option.value;
    input.addEventListener('change', () => {
      response.answers[item.key] = option.value;
      if (item.key === 'activity') {
        response.reasons = [];
        [...PROMIS_SEXFS_COMMON_ITEMS.slice(3), ...PROMIS_SEXFS_PROFILE_ITEMS[response.profile]].forEach(branch => { delete response.answers[branch.key]; });
        renderPromisSexFs();
      } else {
        renderPromisProgress();
      }
      setMessage('#promisMessage', state.session.mode === 'cloud' ? 'PROMIS SexFS 草稿正在云端同步。' : '答案暂存在当前页面；提交后锁定。');
      scheduleSupplementalDraft('promis');
    });
    const labelText = document.createElement('span');
    labelText.innerHTML = `<strong>${option.value}</strong><span>${option.zh}</span><small>${option.en}</small>`;
    label.append(input, labelText);
    choices.append(label);
  });
  fieldset.append(legend, choices);
  return fieldset;
}

function makePromisReasons(response, locked) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'question question-inner';
  fieldset.disabled = locked;
  const legend = document.createElement('legend');
  legend.textContent = '过去30天没有进行性活动的原因（可多选；此项不向伴侣显示具体选择）';
  const help = document.createElement('p');
  help.className = 'question-en';
  help.textContent = 'Why did you not have any sexual activity in the past 30 days? Select all that apply.';
  const choices = document.createElement('div');
  choices.className = 'reason-choice-grid';
  PROMIS_SEXFS_REASON_OPTIONS[response.profile].forEach(option => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = String(option.id);
    input.checked = response.reasons.includes(option.id);
    input.addEventListener('change', () => {
      response.reasons = input.checked
        ? [...new Set([...response.reasons, option.id])].sort((a, b) => a - b)
        : response.reasons.filter(value => value !== option.id);
      renderPromisProgress();
      scheduleSupplementalDraft('promis');
    });
    const text = document.createElement('span');
    text.textContent = `${option.zh} · ${option.en}`;
    label.append(input, text);
    choices.append(label);
  });
  fieldset.append(legend, help, choices);
  return fieldset;
}

function renderPromisProgress() {
  const model = state.promisSexFs;
  for (const person of ['A', 'B']) {
    const inspection = inspectPromisSexFs(model.responses[person]);
    const remote = state.session.mode === 'cloud' && person !== state.session.role;
    const answered = remote ? state.cloudProgress.promis[person] : inspection.answered;
    const required = remote ? state.cloudPromisRequired[person] : inspection.required;
    $(`#promisProgress${person}`).textContent = `${answered}/${required || '—'}${model.submitted[person] ? ' · 已锁定' : ''}`;
  }
}

function renderPromisResults() {
  const model = state.promisSexFs;
  const scores = { A: scorePromisSexFs(model.responses.A), B: scorePromisSexFs(model.responses.B) };
  const ready = model.submitted.A && model.submitted.B && scores.A.complete && scores.B.complete;
  $('#promisResults').hidden = !ready;
  if (!ready) return;
  for (const person of ['A', 'B']) {
    const score = scores[person];
    $(`#promisProfile${person}`).textContent = PROMIS_SEXFS_PROFILES[score.profile].label;
    const list = $(`#promisDomains${person}`);
    list.replaceChildren(...Object.values(score.domains).map(domain => {
      const item = document.createElement('li');
      const direction = domain.direction === 'higher-worse' ? '越高表示不适越多' : domain.direction === 'higher-more' ? '越高表示兴趣越多' : '越高表示功能／体验越好';
      item.textContent = domain.available ? `${domain.label}：原始域分 ${domain.raw}/${domain.range[1]}（${direction}）` : `${domain.label}：不计分（${domain.reason}）`;
      return item;
    }));
    if (!score.sexuallyActive) {
      const item = document.createElement('li');
      item.textContent = '无性活动分支：仅作描述；不生成性功能或满意度域分，具体原因不展示给伴侣。';
      list.append(item);
    }
  }
}

function renderPromisSexFs() {
  const model = state.promisSexFs;
  if (state.session.mode === 'cloud') model.person = state.session.role;
  const person = model.person;
  const response = model.responses[person];
  const locked = model.submitted[person];
  $('#promisPerson').value = person;
  $('#promisPerson').disabled = state.session.mode === 'cloud';
  $('#promisProfileSelect').value = response.profile;
  $('#promisProfileSelect').disabled = locked;
  $('#submitPromisBtn').disabled = locked;
  $('#clearPromisBtn').disabled = locked;
  const questions = [...PROMIS_SEXFS_COMMON_ITEMS.slice(0, 3).map(item => makePromisQuestion(item, response, locked))];
  if (response.answers.activity === 2) {
    questions.push(...PROMIS_SEXFS_COMMON_ITEMS.slice(3).map(item => makePromisQuestion(item, response, locked)));
    questions.push(...PROMIS_SEXFS_PROFILE_ITEMS[response.profile].map(item => makePromisQuestion(item, response, locked)));
  } else if (response.answers.activity === 1) {
    questions.push(makePromisReasons(response, locked));
  }
  $('#promisQuestions').replaceChildren(...questions);
  renderPromisProgress();
  renderPromisResults();
}

async function submitPromisSexFs() {
  const model = state.promisSexFs;
  const person = model.person;
  const inspection = inspectPromisSexFs(model.responses[person]);
  if (!inspection.complete) {
    setMessage('#promisMessage', inspection.invalid.length ? '存在不符合正式选项范围的回答。' : `还有 ${inspection.missing.length} 项未完成。`);
    return;
  }
  if (state.session.mode === 'cloud') {
    await savePromisSexFsToCloud(true);
    return;
  }
  model.submitted[person] = true;
  if (person === 'A' && !model.submitted.B) model.person = 'B';
  renderPromisSexFs();
  setMessage('#promisMessage', person === 'A' ? 'A 的 PROMIS SexFS 已提交；现在请由伴侣 B 独立作答并自行选择适用身体域。' : 'B 的 PROMIS SexFS 已提交；双方原始域结果已解锁。');
}

async function submitRelationshipMeasure(measure) {
  const definition = relationshipMeasureDefinitions[measure];
  const model = state.relationshipMeasures[measure];
  const person = model.person;
  const inspection = inspectScaleAnswers(model.answers[person], definition.items, definition.min, definition.max);
  if (!inspection.complete) {
    setMessage(`#${measure}Message`, inspection.invalid.length ? `存在非法题值：${inspection.invalid.join('、')}。` : `还有 ${inspection.missing.length} 题未完成。`);
    return;
  }
  if (state.session.mode === 'cloud') {
    await saveRelationshipMeasureToCloud(measure, true);
    return;
  }
  model.submitted[person] = true;
  if (person === 'A' && !model.submitted.B) model.person = 'B';
  renderRelationshipMeasure(measure);
  setMessage(`#${measure}Message`, person === 'A' ? `A 的 ${definition.label} 已提交；现在请由伴侣 B 独立作答。` : `B 的 ${definition.label} 已提交；双方结果已解锁。`);
}

function renderSession() {
  const active = state.session.mode === 'cloud' && state.session.code;
  const statusLabels = {
    unconfigured: '远程服务未开通',
    checking: '正在检查远程服务',
    online: '远程服务在线',
    offline: '远程服务不可用'
  };
  $('#activeSession').hidden = !active;
  $('#cloudStatus').textContent = statusLabels[cloudAvailability.status];
  $('#cloudDot').classList.toggle('ok', cloudReady());
  $('#privacyBadge').textContent = active ? (cloudReady() ? '云同步会话' : '云会话待连接') : '本地模式';
  $('#cloudNotice').hidden = cloudReady();
  $('#cloudNotice').querySelector('strong').textContent = cloudAvailability.status === 'checking'
    ? '正在检查远程服务。'
    : cloudAvailability.status === 'offline'
      ? '远程服务暂不可用。'
      : '远程跨设备功能尚未开通。';
  $('#cloudNoticeText').textContent = cloudAvailability.status === 'unconfigured'
    ? '当前部署没有连接远程数据库，创建和加入会话已禁用；本地模式不能跨设备。'
    : `${cloudAvailability.detail}。创建和加入会话暂时不可用。`;
  $('#retryCloudBtn').disabled = !inspectedCloudConfig.valid || cloudAvailability.status === 'checking';
  for (const id of ['createPin', 'generatePinBtn', 'togglePinBtn', 'createSessionBtn', 'joinCode', 'joinPin', 'joinSessionBtn']) {
    $(`#${id}`).disabled = !cloudReady();
  }
  $('#refreshSessionBtn').disabled = active && !cloudReady();
  $('#deleteSessionBtn').disabled = active && !cloudReady();
  $('#copyPinBtn').hidden = !(active && state.session.role === 'A' && state.session.invitePin);
  if (active) {
    $('#activeCode').textContent = state.session.code;
    $('#activeRole').textContent = state.session.role;
    $('#submitA').textContent = state.submitted.A ? '35/35 · 已锁定' : `${state.cloudProgress.cpq.A}/35 · 作答中`;
    $('#submitB').textContent = state.submitted.B ? '35/35 · 已锁定' : `${state.cloudProgress.cpq.B}/35 · 作答中`;
  }
}

function appendScoreCell(row, value) {
  const cell = document.createElement('td');
  const strong = document.createElement('strong');
  strong.textContent = String(value);
  cell.append(strong);
  row.append(cell);
}

function renderResults() {
  const dyad = scoreDyad(state.answers.A, state.answers.B);
  const ready = dyad.complete && state.submitted.A && state.submitted.B;
  $('#resultContent').hidden = !ready;
  $('#resultGate').hidden = ready;
  $('#exportBtn').disabled = !ready;

  if (!ready) {
    const A = inspectAnswers(state.answers.A);
    const B = inspectAnswers(state.answers.B);
    const answeredA = state.session.mode === 'cloud' ? state.cloudProgress.cpq.A : A.answered;
    const answeredB = state.session.mode === 'cloud' ? state.cloudProgress.cpq.B : B.answered;
    $('#resultGate').textContent = `等待双方完成并提交。A：${answeredA}/35${state.submitted.A ? '，已锁定' : ''}；B：${answeredB}/35${state.submitted.B ? '，已锁定' : ''}。`;
    return;
  }

  const scoreCards = [];
  for (const [key, definition] of Object.entries(CPQ_SCORING)) {
    const card = document.createElement('article');
    card.className = 'score-summary-card';
    const title = document.createElement('h4');
    title.textContent = definition.labelZh;
    const english = document.createElement('small');
    english.textContent = definition.labelEn;
    const pair = document.createElement('dl');
    pair.className = 'score-pair';
    for (const person of ['A', 'B']) {
      const item = document.createElement('div');
      const label = document.createElement('dt');
      label.textContent = `伴侣 ${person}`;
      const value = document.createElement('dd');
      value.textContent = String(dyad[person].scores[key]);
      item.append(label, value);
      pair.append(item);
    }
    const range = document.createElement('p');
    range.className = 'field-help';
    range.textContent = `理论范围 ${definition.min}–${definition.max}`;
    card.append(title, english, pair, range);
    scoreCards.push(card);
  }
  $('#scoreCards').replaceChildren(...scoreCards);

  const comparisons = [
    ['建设性沟通', dyad.comparisons.constructiveCommunication],
    ['A 要求 → B 回避', dyad.comparisons.aDemandBWithdraw],
    ['B 要求 → A 回避', dyad.comparisons.bDemandAWithdraw]
  ];
  $('#comparisonRows').replaceChildren(...comparisons.map(([labelText, values]) => {
    const row = document.createElement('tr');
    const label = document.createElement('th');
    label.scope = 'row';
    label.textContent = labelText;
    row.append(label);
    appendScoreCell(row, values.reportA);
    appendScoreCell(row, values.reportB);
    appendScoreCell(row, values.gap);
    return row;
  }));

  const communicationStrain = computeCommunicationStrain(dyad);
  $('#communicationStrainValue').textContent = communicationStrain.value.toFixed(1);
  $('#lowConstructiveValue').textContent = `${communicationStrain.components.lowConstructiveCommunication.toFixed(1)}/100`;
  $('#demandWithdrawValue').textContent = `${communicationStrain.components.demandWithdraw.toFixed(1)}/100`;

  const probability = evaluateDivorceProbability(
    { cpqCommunicationStrain: communicationStrain.value },
    divorceModelConfig
  );
  const probabilityValue = $('#divorceProbabilityValue');
  if (probability.available) {
    probabilityValue.textContent = `${probability.percentage.toFixed(1)}%`;
    probabilityValue.classList.remove('unavailable');
    $('#divorceProbabilityDetail').textContent = `${probability.horizonMonths} 个月内法律离婚概率 · 模型 ${probability.modelId} · 适用人群：${probability.population}`;
  } else {
    probabilityValue.textContent = '不可计算';
    probabilityValue.classList.add('unavailable');
    $('#divorceProbabilityDetail').textContent = probability.reason;
  }
}

function revealCpqResults() {
  if (!$('#questionnaire').classList.contains('active')) activateTab('questionnaire');
  requestAnimationFrame(() => $('#cpqResultsBlock').scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function saveSessionToken() {
  if (state.session.mode !== 'cloud') return;
  const { mode, code, role, token } = state.session;
  localStorage.setItem('cpqSessionV2', JSON.stringify({ mode, code, role, token }));
}

function loadSessionToken() {
  try {
    const saved = JSON.parse(localStorage.getItem('cpqSessionV2') || 'null');
    if (saved && /^\d{6}$/.test(saved.code) && ['A', 'B'].includes(saved.role) && saved.token) {
      state.session = { mode: 'cloud', code: saved.code, role: saved.role, token: saved.token, invitePin: null };
      state.respondent = saved.role;
      state.ecrPerson = saved.role;
      state.dciPerson = saved.role;
      Object.values(state.relationshipMeasures).forEach(measure => { measure.person = saved.role; });
      state.promisSexFs.person = saved.role;
      return true;
    }
  } catch (_) {
    localStorage.removeItem('cpqSessionV2');
  }
  return false;
}

async function rpc(name, body) {
  if (!cloudReady()) throw new Error('远程服务当前不可用。');
  return callCloudRpc(cfg, name, body);
}

async function createCloudSession() {
  const pin = $('#createPin').value.trim();
  if (!/^\d{6,12}$/.test(pin)) {
    setMessage('#sessionMessage', '请输入 6–12 位数字 PIN。');
    return;
  }
  try {
    setMessage('#sessionMessage', '正在创建会话…');
    const data = await rpc('create_couple_session', { p_pin: pin });
    resetAssessment('cloud');
    state.session = { mode: 'cloud', code: data.code, role: 'A', token: data.token, invitePin: pin };
    state.respondent = 'A';
    state.ecrPerson = 'A';
    state.dciPerson = 'A';
    Object.values(state.relationshipMeasures).forEach(measure => { measure.person = 'A'; });
    state.promisSexFs.person = 'A';
    saveSessionToken();
    $('#createPin').value = '';
    renderAll();
    setMessage('#sessionMessage', `会话 ${data.code} 已创建。请分别发送邀请码和 PIN；PIN 仅保留到本页刷新前。`);
  } catch (error) {
    setMessage('#sessionMessage', `创建失败：${error.message}`);
  }
}

async function joinCloudSession() {
  const code = $('#joinCode').value.trim();
  const pin = $('#joinPin').value.trim();
  if (!/^\d{6}$/.test(code) || !/^\d{6,12}$/.test(pin)) {
    setMessage('#sessionMessage', '请输入 6 位邀请码和 6–12 位数字 PIN。');
    return;
  }
  try {
    setMessage('#sessionMessage', '正在加入会话…');
    const data = await rpc('join_couple_session', { p_code: code, p_pin: pin });
    resetAssessment('cloud');
    state.session = { mode: 'cloud', code, role: 'B', token: data.token, invitePin: null };
    state.respondent = 'B';
    state.ecrPerson = 'B';
    state.dciPerson = 'B';
    Object.values(state.relationshipMeasures).forEach(measure => { measure.person = 'B'; });
    state.promisSexFs.person = 'B';
    saveSessionToken();
    $('#joinPin').value = '';
    await refreshCloudSession();
    setMessage('#sessionMessage', `已作为伴侣 B 加入会话 ${code}。`);
  } catch (error) {
    setMessage('#sessionMessage', `加入失败：${error.message}`);
  }
}

function normalizeAnswers(value) {
  if (!Array.isArray(value) || value.length !== 35) return blankAnswers();
  return value.map(answer => Number.isInteger(answer) && answer >= 1 && answer <= 9 ? answer : null);
}

function normalizeEcrAnswers(value) {
  if (!Array.isArray(value) || value.length !== 36) return blankEcrAnswers();
  return value.map(answer => Number.isInteger(answer) && answer >= 1 && answer <= 7 ? answer : null);
}

function normalizeDciAnswers(value) {
  if (!Array.isArray(value) || value.length !== 37) return blankDciAnswers();
  return value.map(answer => Number.isInteger(answer) && answer >= 1 && answer <= 5 ? answer : null);
}

function normalizeDciScores(value) {
  const validation = validateDciScores(value);
  return validation.valid ? { ...blankDciScores(), ...validation.scores } : blankDciScores();
}

function normalizeRelationshipAnswers(measure, value) {
  const definition = relationshipMeasureDefinitions[measure];
  if (!Array.isArray(value) || value.length !== definition.items.length) return blankScaleAnswers(definition.items.length);
  return value.map((answer, index) => {
    const minimum = definition.items[index].min ?? definition.min;
    const maximum = definition.items[index].max ?? definition.max;
    return Number.isInteger(answer) && answer >= minimum && answer <= maximum ? answer : null;
  });
}

function normalizePromisSexFsResponse(value) {
  const profile = PROMIS_SEXFS_PROFILES[value?.profile] ? value.profile : 'vaginal';
  const normalized = blankPromisSexFsResponse(profile);
  const items = [...PROMIS_SEXFS_COMMON_ITEMS, ...PROMIS_SEXFS_PROFILE_ITEMS[profile]];
  if (value?.answers && typeof value.answers === 'object' && !Array.isArray(value.answers)) {
    items.forEach(item => {
      const answer = value.answers[item.key];
      if (Number.isInteger(answer) && item.choices.some(option => option.value === answer)) normalized.answers[item.key] = answer;
    });
  }
  if (Array.isArray(value?.reasons)) {
    normalized.reasons = [...new Set(value.reasons.filter(reason => Number.isInteger(reason) && reason >= 1 && reason <= PROMIS_SEXFS_REASON_OPTIONS[profile].length))].sort((a, b) => a - b);
  }
  return normalized;
}

function normalizeAnsweredCount(value, maximum, fallback = 0) {
  return Number.isInteger(value) && value >= 0 && value <= maximum ? value : fallback;
}

function normalizeEvents(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(event =>
    event && ['A', 'B'].includes(event.person) && AFFECT_CODES[event.code] &&
    Number.isFinite(event.startMs) && (event.endMs === null || Number.isFinite(event.endMs))
  ).slice(0, 2000).map(event => ({
    person: event.person,
    code: event.code,
    startMs: event.startMs,
    endMs: event.endMs
  }));
}

function normalizeSpaffRatings(value) {
  const normalized = { A: blankSpaffRatings(), B: blankSpaffRatings() };
  for (const person of ['A', 'B']) {
    for (const code of Object.keys(SPAFF_INFORMED_DIMENSIONS)) {
      const rating = value?.[person]?.[code];
      normalized[person][code] = Number.isInteger(rating) && rating >= 1 && rating <= 10 ? rating : null;
    }
  }
  return normalized;
}

async function refreshCloudSession({ silent = false } = {}) {
  if (state.session.mode !== 'cloud') return;
  if (cloudRefreshInFlight) return;
  cloudRefreshInFlight = true;
  try {
    const data = await rpc('get_couple_session', { p_code: state.session.code, p_token: state.session.token });
    state.submitted.A = Boolean(data.submittedA);
    state.submitted.B = Boolean(data.submittedB);
    state.cloudProgress.cpq.A = normalizeAnsweredCount(data.answeredCountA, 35, state.submitted.A ? 35 : state.cloudProgress.cpq.A);
    state.cloudProgress.cpq.B = normalizeAnsweredCount(data.answeredCountB, 35, state.submitted.B ? 35 : state.cloudProgress.cpq.B);
    if (cpqDraftRevision === cpqSyncedRevision) {
      state.answers[state.session.role] = normalizeAnswers(data.myAnswers);
    }
    state.ecrSubmitted.A = Boolean(data.ecrSubmittedA);
    state.ecrSubmitted.B = Boolean(data.ecrSubmittedB);
    state.cloudProgress.ecr.A = normalizeAnsweredCount(data.ecrAnsweredCountA, 36, state.ecrSubmitted.A ? 36 : state.cloudProgress.ecr.A);
    state.cloudProgress.ecr.B = normalizeAnsweredCount(data.ecrAnsweredCountB, 36, state.ecrSubmitted.B ? 36 : state.cloudProgress.ecr.B);
    state.ecrAnswers[state.session.role] = normalizeEcrAnswers(data.myEcrAnswers);
    state.dciSubmitted.A = Boolean(data.dciSubmittedA);
    state.dciSubmitted.B = Boolean(data.dciSubmittedB);
    state.cloudProgress.dci.A = normalizeAnsweredCount(data.dciAnsweredCountA, 37, state.dciSubmitted.A ? 37 : state.cloudProgress.dci.A);
    state.cloudProgress.dci.B = normalizeAnsweredCount(data.dciAnsweredCountB, 37, state.dciSubmitted.B ? 37 : state.cloudProgress.dci.B);
    state.dciAnswers[state.session.role] = normalizeDciAnswers(data.myDciAnswers);
    state.dciScores[state.session.role] = normalizeDciScores(data.myDciScores);
    for (const [measure, definition] of Object.entries(relationshipMeasureDefinitions)) {
      const prefix = measure[0].toUpperCase() + measure.slice(1);
      const model = state.relationshipMeasures[measure];
      model.submitted.A = Boolean(data[`${measure}SubmittedA`]);
      model.submitted.B = Boolean(data[`${measure}SubmittedB`]);
      state.cloudProgress[measure].A = normalizeAnsweredCount(data[`${measure}AnsweredCountA`], definition.items.length, model.submitted.A ? definition.items.length : state.cloudProgress[measure].A);
      state.cloudProgress[measure].B = normalizeAnsweredCount(data[`${measure}AnsweredCountB`], definition.items.length, model.submitted.B ? definition.items.length : state.cloudProgress[measure].B);
      model.answers[state.session.role] = normalizeRelationshipAnswers(measure, data[`my${prefix}Answers`]);
      if (data[`${measure}AnswersA`] && data[`${measure}AnswersB`]) {
        model.answers.A = normalizeRelationshipAnswers(measure, data[`${measure}AnswersA`]);
        model.answers.B = normalizeRelationshipAnswers(measure, data[`${measure}AnswersB`]);
      } else {
        const other = state.session.role === 'A' ? 'B' : 'A';
        model.answers[other] = blankScaleAnswers(definition.items.length);
      }
    }
    state.promisSexFs.submitted.A = Boolean(data.promisSubmittedA);
    state.promisSexFs.submitted.B = Boolean(data.promisSubmittedB);
    state.cloudProgress.promis.A = normalizeAnsweredCount(data.promisAnsweredCountA, 13, state.cloudProgress.promis.A);
    state.cloudProgress.promis.B = normalizeAnsweredCount(data.promisAnsweredCountB, 13, state.cloudProgress.promis.B);
    state.cloudPromisRequired.A = normalizeAnsweredCount(data.promisRequiredCountA, 13, state.cloudPromisRequired.A);
    state.cloudPromisRequired.B = normalizeAnsweredCount(data.promisRequiredCountB, 13, state.cloudPromisRequired.B);
    state.promisSexFs.responses[state.session.role] = normalizePromisSexFsResponse(data.myPromisResponse);
    if (data.promisResponseA && data.promisResponseB) {
      state.promisSexFs.responses.A = normalizePromisSexFsResponse(data.promisResponseA);
      state.promisSexFs.responses.B = normalizePromisSexFsResponse(data.promisResponseB);
    } else {
      const other = state.session.role === 'A' ? 'B' : 'A';
      state.promisSexFs.responses[other] = blankPromisSexFsResponse();
    }
    if (data.answersA && data.answersB) {
      state.answers.A = normalizeAnswers(data.answersA);
      state.answers.B = normalizeAnswers(data.answersB);
      state.events = normalizeEvents(data.spaffEvents);
      state.spaffRatings = normalizeSpaffRatings(data.spaffRatings);
    } else {
      const other = state.session.role === 'A' ? 'B' : 'A';
      state.answers[other] = blankAnswers();
      state.events = [];
      state.spaffRatings = { A: blankSpaffRatings(), B: blankSpaffRatings() };
    }
    if (data.ecrAnswersA && data.ecrAnswersB) {
      state.ecrAnswers.A = normalizeEcrAnswers(data.ecrAnswersA);
      state.ecrAnswers.B = normalizeEcrAnswers(data.ecrAnswersB);
    } else {
      const other = state.session.role === 'A' ? 'B' : 'A';
      state.ecrAnswers[other] = blankEcrAnswers();
    }
    if (data.dciAnswersA && data.dciAnswersB && data.dciScoresA && data.dciScoresB) {
      state.dciAnswers.A = normalizeDciAnswers(data.dciAnswersA);
      state.dciAnswers.B = normalizeDciAnswers(data.dciAnswersB);
      state.dciScores.A = normalizeDciScores(data.dciScoresA);
      state.dciScores.B = normalizeDciScores(data.dciScoresB);
    } else {
      const other = state.session.role === 'A' ? 'B' : 'A';
      state.dciAnswers[other] = blankDciAnswers();
      state.dciScores[other] = blankDciScores();
    }
    if (silent) {
      // Polling must not rebuild an actively clicked questionnaire. Replacing
      // its radio nodes mid-pointer interaction was the cause of missed clicks.
      renderSession();
      renderProgress();
      renderResults();
      renderEcrProgress();
      renderEcrResults();
      renderDciProgress();
      renderDciTotals();
      Object.keys(relationshipMeasureDefinitions).forEach(measure => {
        renderRelationshipProgress(measure);
        renderRelationshipResults(measure);
      });
      renderPromisProgress();
      renderPromisResults();
      renderObservation();
      renderLongitudinal();
    } else {
      renderAll();
    }
    if (!silent) {
      setMessage('#sessionMessage', state.submitted.A && state.submitted.B ? '双方已提交，标准结果已解锁。' : '同步完成。');
    }
  } catch (error) {
    if (!silent) setMessage('#sessionMessage', `同步失败：${error.message}`);
  } finally {
    cloudRefreshInFlight = false;
  }
}

async function saveAnswers(submit = false) {
  clearTimeout(draftTimer);
  draftTimer = null;
  const person = state.respondent;
  const inspection = inspectAnswers(state.answers[person]);
  if (submit && !inspection.complete) {
    setMessage('#questionnaireMessage', `还有 ${inspection.missing.length} 题未完成：${inspection.missing.join('、')}。`);
    return;
  }
  if (state.session.mode === 'local') {
    if (submit) {
      state.submitted[person] = true;
      if (person === 'A') state.respondent = 'B';
      renderAll();
      setMessage('#questionnaireMessage', person === 'A' ? 'A 已提交并锁定。现在请把设备交给伴侣 B。' : 'B 已提交并锁定，标准结果已解锁。');
      if (person === 'B') revealCpqResults();
    } else {
      setMessage('#questionnaireMessage', '答案已暂存在当前页面；刷新页面会清除本地数据。');
    }
    return;
  }
  if (person !== state.session.role) return;
  if (submit && cpqSubmitQueued) return;
  if (submit) {
    cpqSubmitQueued = true;
    $('#submitAnswersBtn').disabled = true;
  }
  const revision = cpqDraftRevision;
  const answers = [...state.answers[person]];
  const operation = async () => {
    // If this draft has not started and a newer local revision already exists,
    // skip it. The newer scheduled snapshot will be the next serialized write.
    if (!submit && revision < cpqDraftRevision) return { skipped: true };
    cpqSaveActive = true;
    cpqSyncError = '';
    renderCpqSyncStatus();
    setMessage('#questionnaireMessage', submit ? '正在提交并锁定…' : '正在同步云端…');
    try {
      const result = await rpc('save_couple_answers', {
        p_code: state.session.code,
        p_token: state.session.token,
        p_answers: answers,
        p_submit: submit
      });
      cpqSyncedRevision = Math.max(cpqSyncedRevision, revision);
      state.cloudProgress.cpq[person] = inspection.answered;
      if (submit) state.submitted[person] = true;
      return result;
    } finally {
      cpqSaveActive = false;
      renderCpqSyncStatus();
    }
  };
  const queued = cpqSaveTail.catch(() => undefined).then(operation);
  cpqSaveTail = queued;
  try {
    const result = await queued;
    if (result?.skipped) {
      renderCpqSyncStatus();
      return;
    }
    if (submit) {
      renderAll();
      setMessage('#questionnaireMessage', '提交成功，答案已锁定。');
      await refreshCloudSession();
      if (state.submitted.A && state.submitted.B) revealCpqResults();
    } else if (revision === cpqDraftRevision) {
      setMessage('#questionnaireMessage', `云端已同步 ${inspection.answered}/35。`);
      renderProgress();
    }
  } catch (error) {
    cpqSyncError = error.message;
    renderCpqSyncStatus();
    setMessage('#questionnaireMessage', `保存失败：${error.message}`);
  } finally {
    if (submit) {
      cpqSubmitQueued = false;
      $('#submitAnswersBtn').disabled = state.submitted[person];
    }
  }
}

async function saveEcrToCloud(submit = false) {
  if (state.session.mode !== 'cloud') return;
  if (submit) clearTimeout(supplementalDraftTimers.ecr);
  const person = state.session.role;
  const inspection = inspectEcrAnswers(state.ecrAnswers[person]);
  if (submit && !inspection.complete) {
    setMessage('#ecrMessage', inspection.invalid.length ? `存在非法题值：${inspection.invalid.join('、')}。` : `还有 ${inspection.missing.length} 题未完成。`);
    return;
  }
  try {
    if (submit) setMessage('#ecrMessage', '正在提交并锁定 ECR-R…');
    await rpc('save_ecr_answers', {
      p_code: state.session.code,
      p_token: state.session.token,
      p_answers: state.ecrAnswers[person],
      p_submit: submit
    });
    if (submit) state.ecrSubmitted[person] = true;
    renderEcr();
    if (submit) {
      setMessage('#ecrMessage', `${person} 的 ECR-R 已云端提交并锁定；等待伴侣独立提交。`);
      await refreshCloudSession();
    }
  } catch (error) {
    setMessage('#ecrMessage', `ECR-R 云同步失败：${error.message}`);
  }
}

async function saveDciToCloud(submit = false) {
  if (state.session.mode !== 'cloud') return;
  if (submit) clearTimeout(supplementalDraftTimers.dci);
  const person = state.session.role;
  const validation = validateDciScores(state.dciScores[person]);
  if (!validation.valid) {
    setMessage('#dciMessage', `超出允许范围：${validation.invalid.map(field => DCI_SCORE_FIELDS[field].label).join('、')}。`);
    return;
  }
  try {
    if (submit) setMessage('#dciMessage', '正在提交并锁定 DCI…');
    await rpc('save_dci_data', {
      p_code: state.session.code,
      p_token: state.session.token,
      p_answers: state.dciAnswers[person],
      p_scores: validation.scores,
      p_submit: submit
    });
    if (submit) state.dciSubmitted[person] = true;
    renderDci();
    if (submit) {
      setMessage('#dciMessage', `${person} 的 DCI 已云端提交并锁定；等待伴侣独立提交。`);
      await refreshCloudSession();
    }
  } catch (error) {
    setMessage('#dciMessage', `DCI 云同步失败：${error.message}`);
  }
}

async function saveRelationshipMeasureToCloud(measure, submit = false) {
  if (state.session.mode !== 'cloud') return;
  const definition = relationshipMeasureDefinitions[measure];
  const model = state.relationshipMeasures[measure];
  if (submit) clearTimeout(supplementalDraftTimers[measure]);
  const person = state.session.role;
  const inspection = inspectScaleAnswers(model.answers[person], definition.items, definition.min, definition.max);
  if (submit && !inspection.complete) {
    setMessage(`#${measure}Message`, `还有 ${inspection.missing.length} 题未完成。`);
    return;
  }
  try {
    if (submit) setMessage(`#${measure}Message`, `正在提交并锁定 ${definition.label}…`);
    await rpc('save_relationship_measure', {
      p_code: state.session.code,
      p_token: state.session.token,
      p_measure: measure,
      p_answers: model.answers[person],
      p_submit: submit
    });
    state.cloudProgress[measure][person] = inspection.answered;
    if (submit) model.submitted[person] = true;
    renderRelationshipMeasure(measure);
    if (submit) {
      setMessage(`#${measure}Message`, `${person} 的 ${definition.label} 已云端提交并锁定；等待伴侣独立提交。`);
      await refreshCloudSession();
    }
  } catch (error) {
    setMessage(`#${measure}Message`, `${definition.label} 云同步失败：${error.message}`);
  }
}

async function savePromisSexFsToCloud(submit = false) {
  if (state.session.mode !== 'cloud') return;
  if (submit) clearTimeout(supplementalDraftTimers.promis);
  const person = state.session.role;
  const response = state.promisSexFs.responses[person];
  const inspection = inspectPromisSexFs(response);
  if (submit && !inspection.complete) {
    setMessage('#promisMessage', `还有 ${inspection.missing.length} 项未完成。`);
    return;
  }
  try {
    if (submit) setMessage('#promisMessage', '正在提交并锁定 PROMIS SexFS…');
    await rpc('save_promis_sexfs', {
      p_code: state.session.code,
      p_token: state.session.token,
      p_response: response,
      p_submit: submit
    });
    state.cloudProgress.promis[person] = inspection.answered;
    state.cloudPromisRequired[person] = inspection.required;
    if (submit) state.promisSexFs.submitted[person] = true;
    renderPromisSexFs();
    if (submit) {
      setMessage('#promisMessage', `${person} 的 PROMIS SexFS 已云端提交并锁定；等待伴侣独立提交。`);
      await refreshCloudSession();
    }
  } catch (error) {
    setMessage('#promisMessage', `PROMIS SexFS 云同步失败：${error.message}`);
  }
}

function scheduleCloudDraft() {
  if (state.session.mode !== 'cloud' || isLocked(state.respondent)) return;
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => saveAnswers(false), 200);
}

function scheduleSupplementalDraft(measure) {
  const person = measure === 'ecr'
    ? state.ecrPerson
    : measure === 'dci'
      ? state.dciPerson
      : measure === 'promis'
        ? state.promisSexFs.person
        : state.relationshipMeasures[measure].person;
  if (state.session.mode !== 'cloud' || state.session.role !== person) return;
  const submitted = measure === 'ecr'
    ? state.ecrSubmitted[state.session.role]
    : measure === 'dci'
      ? state.dciSubmitted[state.session.role]
      : measure === 'promis'
        ? state.promisSexFs.submitted[state.session.role]
        : state.relationshipMeasures[measure].submitted[state.session.role];
  if (submitted) return;
  clearTimeout(supplementalDraftTimers[measure]);
  supplementalDraftTimers[measure] = setTimeout(() => {
    if (measure === 'ecr') saveEcrToCloud(false);
    else if (measure === 'dci') saveDciToCloud(false);
    else if (measure === 'promis') savePromisSexFsToCloud(false);
    else saveRelationshipMeasureToCloud(measure, false);
  }, 1000);
}

function leaveCloudSession() {
  localStorage.removeItem('cpqSessionV2');
  resetAssessment('local');
  setMessage('#sessionMessage', '已离开云端会话并切换到新的本地测评。');
}

async function deleteCloudSession() {
  if (state.session.mode !== 'cloud') return;
  if (!window.confirm('删除后双方的云端答案和观察记录都无法恢复。确定删除吗？')) return;
  try {
    await rpc('delete_couple_session', { p_code: state.session.code, p_token: state.session.token });
    leaveCloudSession();
    setMessage('#sessionMessage', '云端会话及其数据已删除。');
  } catch (error) {
    setMessage('#sessionMessage', `删除失败：${error.message}`);
  }
}

function currentCpqMeasure() {
  const dyad = scoreDyad(state.answers.A, state.answers.B);
  if (!dyad.complete || !state.submitted.A || !state.submitted.B) return null;
  const communicationStrain = computeCommunicationStrain(dyad);
  const divorceProbability = evaluateDivorceProbability(
    { cpqCommunicationStrain: communicationStrain.value },
    divorceModelConfig
  );
  const scores = {
    A: {
      ...dyad.A.scores,
      demandWithdrawMean: (dyad.A.scores.selfDemandPartnerWithdraw + dyad.A.scores.partnerDemandSelfWithdraw) / 2
    },
    B: {
      ...dyad.B.scores,
      demandWithdrawMean: (dyad.B.scores.selfDemandPartnerWithdraw + dyad.B.scores.partnerDemandSelfWithdraw) / 2
    }
  };
  return {
    version: CPQ_VERSION,
    scoring: 'Crenshaw et al. (2017), summed subscales; items 1, 24, and 26 reverse-scored as 10 - response',
    answers: state.answers,
    scores,
    pairedReports: dyad.comparisons,
    communicationStrain,
    divorceProbability
  };
}

function assessmentMetadata() {
  const coupleId = $('#coupleResearchId').value.trim();
  const date = $('#assessmentDate').value;
  const timepoint = $('#timepointLabel').value.trim();
  const errors = [];
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(coupleId)) errors.push('匿名情侣编号需为 3–64 位字母、数字、下划线或连字符');
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) errors.push('请选择有效测量日期');
  if (!timepoint || timepoint.length > 80) errors.push('请输入 1–80 字的时间点标签');
  return { valid: !errors.length, errors, value: { coupleId, date, timepoint } };
}

function currentLongitudinalRecord() {
  const metadata = assessmentMetadata();
  if (!metadata.valid) return { valid: false, errors: metadata.errors };
  const cpq = currentCpqMeasure();
  const ecrScores = Object.fromEntries(['A', 'B'].map(person => {
    const score = state.ecrSubmitted[person] ? scoreEcrR(state.ecrAnswers[person]) : null;
    return [person, score?.complete ? score : null];
  }));
  const dciValidated = Object.fromEntries(['A', 'B'].map(person => [person, validateDciScores(state.dciScores[person])]));
  const invalidDci = ['A', 'B'].filter(person => !dciValidated[person].valid);
  if (invalidDci.length) return { valid: false, errors: [`伴侣 ${invalidDci.join('、')} 的 DCI 分数超出允许范围`] };
  const dciScores = Object.fromEntries(['A', 'B'].map(person => [person, dciValidated[person].available ? dciValidated[person].scores : null]));
  const hasEcr = Object.values(ecrScores).some(Boolean);
  const hasDci = Object.values(dciScores).some(Boolean);
  const relationshipScores = Object.fromEntries(Object.entries(relationshipMeasureDefinitions).map(([measure, definition]) => [measure, Object.fromEntries(['A', 'B'].map(person => {
    const score = state.relationshipMeasures[measure].submitted[person] ? definition.score(state.relationshipMeasures[measure].answers[person]) : null;
    return [person, score?.complete ? score : null];
  }))]));
  const promisScores = Object.fromEntries(['A', 'B'].map(person => {
    const score = state.promisSexFs.submitted[person] ? scorePromisSexFs(state.promisSexFs.responses[person]) : null;
    return [person, score?.complete ? score : null];
  }));
  const hasRelationshipMeasure = Object.values(relationshipScores).some(scores => Object.values(scores).some(Boolean));
  const hasPromis = Object.values(promisScores).some(Boolean);
  const hasObservation = Boolean(state.events.length || Object.values(state.spaffRatings).some(ratings => Object.values(ratings).some(Number.isFinite)));
  if (!cpq && !hasEcr && !hasDci && !hasRelationshipMeasure && !hasPromis && !hasObservation) return { valid: false, errors: ['至少需要一项已完成测量或观察记录'] };
  const dciBankValidation = validateDciItemBank(dciItemBank);
  return {
    valid: true,
    record: {
      schema: LONGITUDINAL_SCHEMA,
      assessment: metadata.value,
      measures: {
        cpq,
        ecrR: {
          version: ECR_R_VERSION,
          scores: ecrScores,
          answers: Object.fromEntries(['A', 'B'].map(person => [person, ecrScores[person] ? state.ecrAnswers[person] : null])),
          languageStatus: 'Official English wording with non-validated Chinese reading aid'
        },
        dci: {
          version: dciBankValidation.valid ? dciItemBank.version : 'DCI-37 manual scored-result entry',
          scores: dciScores,
          answers: Object.fromEntries(['A', 'B'].map(person => [person, state.dciSubmitted[person] ? state.dciAnswers[person] : null])),
          itemBankBundled: dciBankValidation.valid,
          languageStatus: dciBankValidation.valid
            ? (dciItemBank.translationStatus || 'Official English wording')
            : 'Manual scored-result entry; item wording not recorded'
        },
        csi32: {
          version: CSI_32_VERSION,
          scores: relationshipScores.csi,
          answers: Object.fromEntries(['A', 'B'].map(person => [person, relationshipScores.csi[person] ? state.relationshipMeasures.csi.answers[person] : null])),
          languageStatus: 'Chinese reading aid; a Chinese CSI-32 validation exists, but wording equivalence of this deployment has not been independently audited'
        },
        gmsex: {
          version: GMSEX_VERSION,
          scores: relationshipScores.gmsex,
          answers: Object.fromEntries(['A', 'B'].map(person => [person, relationshipScores.gmsex[person] ? state.relationshipMeasures.gmsex.answers[person] : null])),
          languageStatus: 'Official English adjective pairs with non-validated Chinese reading aid'
        },
        nsssS: {
          version: NSSS_S_VERSION,
          scores: relationshipScores.nsss,
          answers: Object.fromEntries(['A', 'B'].map(person => [person, relationshipScores.nsss[person] ? state.relationshipMeasures.nsss.answers[person] : null])),
          languageStatus: 'Non-official Chinese reading aid; Chinese validation evidence currently applies to a sample of Chinese women'
        },
        kos18: {
          version: KOS_VERSION,
          scores: relationshipScores.kos,
          answers: Object.fromEntries(['A', 'B'].map(person => [person, relationshipScores.kos[person] ? state.relationshipMeasures.kos.answers[person] : null])),
          languageStatus: 'Official English wording with non-validated Chinese reading aid; not a diagnosis or compatibility measure'
        },
        promisSexFs2: {
          version: PROMIS_SEXFS_VERSION,
          scores: promisScores,
          responses: Object.fromEntries(['A', 'B'].map(person => [person, promisScores[person] ? state.promisSexFs.responses[person] : null])),
          languageStatus: 'Official English item IDs and wording with non-validated Chinese reading aid; local output is raw-domain profile, not official T-scores'
        },
        rfs12: {
          version: RFS_VERSION,
          scores: relationshipScores.rfs,
          answers: Object.fromEntries(['A', 'B'].map(person => [person, relationshipScores.rfs[person] ? state.relationshipMeasures.rfs.answers[person] : null])),
          languageStatus: 'Official English wording with non-validated Chinese reading aid'
        },
        observation: {
          macroAffectEvents: state.events,
          spaffInformedRatings: state.spaffRatings,
          status: 'Exploratory only; not a complete or validated SPAFF implementation'
        }
      },
      exportedAt: new Date().toISOString()
    }
  };
}

function downloadJson(record) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `cpq-longitudinal-${record.assessment.coupleId}-${record.assessment.date}.json`;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportLongitudinalRecord() {
  const result = currentLongitudinalRecord();
  if (!result.valid) {
    setMessage('#longitudinalExportMessage', result.errors.join('；'));
    return false;
  }
  downloadJson(result.record);
  setMessage('#longitudinalExportMessage', '档案已下载到本机；本站不会保留副本。');
  return true;
}

function exportResults() {
  if (!currentCpqMeasure()) return;
  if (!exportLongitudinalRecord()) activateTab('longitudinal');
}

const LONGITUDINAL_METRICS = Object.freeze({
  communicationStrain: '沟通压力',
  ecrAnxietyA: 'A 依恋焦虑',
  ecrAnxietyB: 'B 依恋焦虑',
  ecrAvoidanceA: 'A 依恋回避',
  ecrAvoidanceB: 'B 依恋回避',
  dciTotalA: 'A DCI 总分',
  dciTotalB: 'B DCI 总分',
  csiTotalA: 'A CSI-32',
  csiTotalB: 'B CSI-32',
  gmsexMeanA: 'A GMSEX',
  gmsexMeanB: 'B GMSEX',
  nsssTotalA: 'A NSSS-S',
  nsssTotalB: 'B NSSS-S',
  kosTotalA: 'A KOS-18',
  kosTotalB: 'B KOS-18',
  promisSatisfactionRawA: 'A PROMIS 满意度原始域分',
  promisSatisfactionRawB: 'B PROMIS 满意度原始域分',
  rfsTotalA: 'A RFS-12',
  rfsTotalB: 'B RFS-12'
});

function formatMetric(value) {
  return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '—';
}

function renderLongitudinal() {
  const dataset = buildLongitudinalDataset(state.importedRecords);
  const ready = dataset.accepted.length > 0;
  $('#longitudinalResults').hidden = !ready;
  if (!ready) return;
  const previous = $('#longitudinalCouple').value;
  const coupleIds = [...new Set(dataset.accepted.map(point => point.coupleId))];
  $('#longitudinalCouple').replaceChildren(...coupleIds.map(coupleId => {
    const option = document.createElement('option');
    option.value = coupleId;
    option.textContent = coupleId;
    return option;
  }));
  $('#longitudinalCouple').value = coupleIds.includes(previous) ? previous : coupleIds[0];
  const selected = $('#longitudinalCouple').value;
  const points = dataset.accepted.filter(point => point.coupleId === selected);
  $('#longitudinalChanges').replaceChildren(...Object.entries(LONGITUDINAL_METRICS).map(([key, label]) => {
    const card = document.createElement('article');
    card.className = 'trend-card';
    const summary = summarizeChange(points, key);
    const heading = document.createElement('span');
    heading.textContent = label;
    const value = document.createElement('strong');
    value.textContent = summary.available ? `${summary.change >= 0 ? '+' : ''}${summary.change}` : '数据不足';
    const detail = document.createElement('small');
    detail.textContent = summary.available ? `${summary.first} → ${summary.last} · ${summary.from} 至 ${summary.to}` : `${summary.count} 个有效时间点`;
    card.append(heading, value, detail);
    return card;
  }));
  $('#longitudinalRows').replaceChildren(...points.map(point => {
    const row = document.createElement('tr');
    const values = [
      point.date,
      point.timepoint,
      point.metrics.communicationStrain,
      point.metrics.ecrAnxietyA,
      point.metrics.ecrAnxietyB,
      point.metrics.ecrAvoidanceA,
      point.metrics.ecrAvoidanceB,
      point.metrics.dciTotalA,
      point.metrics.dciTotalB,
      point.metrics.csiTotalA,
      point.metrics.csiTotalB,
      point.metrics.gmsexMeanA,
      point.metrics.gmsexMeanB,
      point.metrics.nsssTotalA,
      point.metrics.nsssTotalB,
      point.metrics.kosTotalA,
      point.metrics.kosTotalB,
      point.metrics.promisSatisfactionRawA,
      point.metrics.promisSatisfactionRawB,
      point.metrics.rfsTotalA,
      point.metrics.rfsTotalB
    ];
    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = typeof value === 'string' ? value : formatMetric(value);
      row.append(cell);
    });
    return row;
  }));
}

async function importLongitudinalFiles(fileList) {
  const files = [...fileList];
  if (!files.length) return;
  if (files.length > 200) {
    setMessage('#longitudinalImportMessage', '单次最多载入 200 个文件。');
    return;
  }
  const parsed = [];
  const fileErrors = [];
  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) {
      fileErrors.push(`${file.name} 超过 2 MB`);
      continue;
    }
    try {
      const value = JSON.parse(await file.text());
      if (Array.isArray(value)) parsed.push(...value);
      else parsed.push(value);
    } catch (_) {
      fileErrors.push(`${file.name} 不是有效 JSON`);
    }
  }
  if (parsed.length + state.importedRecords.length > 1000) {
    setMessage('#longitudinalImportMessage', '当前页面最多分析 1000 个时间点。');
    return;
  }
  const dataset = buildLongitudinalDataset([...state.importedRecords, ...parsed]);
  state.importedRecords = dataset.accepted.map(point => point.source);
  renderLongitudinal();
  const rejected = dataset.rejected.length + fileErrors.length;
  setMessage('#longitudinalImportMessage', `已载入 ${dataset.accepted.length} 个有效时间点，拒绝 ${rejected} 个无效或重复记录。${fileErrors.length ? ` ${fileErrors.join('；')}` : ''}`);
  $('#longitudinalFiles').value = '';
}

function closeOpenEvent(person, endMs = Date.now()) {
  const open = [...state.events].reverse().find(event => event.person === person && event.endMs === null);
  if (open) open.endMs = Math.max(endMs, open.startMs);
}

function startAffect(code) {
  const person = $('#observationPerson').value;
  const now = Date.now();
  closeOpenEvent(person, now);
  state.events.push({ person, code, startMs: now, endMs: null });
  renderObservation();
  syncObservation();
}

function stopObservation() {
  closeOpenEvent($('#observationPerson').value);
  renderObservation();
  syncObservation();
}

function eventDuration(event, now = Date.now()) {
  return Math.max(0, (event.endMs ?? now) - event.startMs);
}

function formatDuration(milliseconds) {
  const seconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}分${seconds % 60}秒` : `${seconds}秒`;
}

function durationByCode(person) {
  const result = Object.fromEntries(Object.keys(AFFECT_CODES).map(code => [code, 0]));
  state.events.filter(event => event.person === person).forEach(event => { result[event.code] += eventDuration(event); });
  return result;
}

function renderDuration(person) {
  const durations = durationByCode(person);
  const total = Object.values(durations).reduce((sum, value) => sum + value, 0);
  const rows = Object.entries(durations).map(([code, duration]) => {
    const row = document.createElement('div');
    row.className = 'duration-row';
    const label = document.createElement('span');
    label.textContent = AFFECT_CODES[code].label;
    const track = document.createElement('div');
    track.className = 'duration-track';
    const fill = document.createElement('div');
    fill.className = 'duration-fill';
    fill.style.width = `${total ? duration / total * 100 : 0}%`;
    track.append(fill);
    const value = document.createElement('strong');
    value.textContent = total ? `${Math.round(duration / total * 100)}%` : '—';
    row.append(label, track, value);
    return row;
  });
  $(`#duration${person}`).replaceChildren(...rows);
}

function renderObservation() {
  renderDuration('A');
  renderDuration('B');
  renderSpaffRatings();
  const cards = state.events.map((event, index) => {
    const card = document.createElement('div');
    card.className = 'event';
    const meta = document.createElement('small');
    meta.textContent = `#${index + 1} · 伴侣 ${event.person}`;
    const label = document.createElement('strong');
    label.textContent = AFFECT_CODES[event.code].label;
    const duration = document.createElement('small');
    duration.textContent = `${formatDuration(eventDuration(event))}${event.endMs === null ? ' · 进行中' : ''}`;
    card.append(meta, label, duration);
    return card;
  });
  if (!cards.length) {
    const empty = document.createElement('p');
    empty.textContent = '尚未记录状态。选择编码对象后点击一个情感状态开始计时。';
    cards.push(empty);
  }
  $('#observationTimeline').replaceChildren(...cards);
}

function renderSpaffRatings() {
  const person = $('#spaffPerson').value;
  const cards = Object.entries(SPAFF_INFORMED_DIMENSIONS).map(([code, definition]) => {
    const label = document.createElement('label');
    label.className = `rating-item ${definition.tone}`;
    const heading = document.createElement('span');
    heading.className = 'rating-label';
    heading.textContent = definition.label;
    const detail = document.createElement('small');
    detail.textContent = definition.detail;
    const select = document.createElement('select');
    select.setAttribute('aria-label', `伴侣 ${person} · ${definition.label}`);
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = '未评级';
    select.append(blank, ...Array.from({ length: 10 }, (_, index) => {
      const option = document.createElement('option');
      option.value = String(index + 1);
      option.textContent = String(index + 1);
      return option;
    }));
    select.value = state.spaffRatings[person][code] ?? '';
    select.addEventListener('change', event => {
      state.spaffRatings[person][code] = event.target.value ? Number(event.target.value) : null;
      syncObservation();
    });
    label.append(heading, detail, select);
    return label;
  });
  $('#spaffRatingGrid').replaceChildren(...cards);
}

async function syncObservation() {
  if (state.session.mode !== 'cloud' || !state.submitted.A || !state.submitted.B) return;
  try {
    await rpc('save_spaff_observation', {
      p_code: state.session.code,
      p_token: state.session.token,
      p_events: state.events,
      p_ratings: state.spaffRatings
    });
  } catch (error) {
    setMessage('#sessionMessage', `观察记录同步失败：${error.message}`);
  }
}

function setupObservation() {
  $('#affectButtons').replaceChildren(...Object.entries(AFFECT_CODES).map(([code, definition]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button affect-button';
    const label = document.createElement('strong');
    label.textContent = definition.label;
    const detail = document.createElement('span');
    detail.textContent = definition.detail;
    button.append(label, detail);
    button.addEventListener('click', () => startAffect(code));
    return button;
  }));
}

function renderAll() {
  renderSession();
  renderQuestions();
  renderSupplements();
  renderResults();
  renderObservation();
  renderLongitudinal();
}

function setupActions() {
  $('#respondentSelect').addEventListener('change', event => setRespondent(event.target.value));
  $$('.stage').forEach(button => button.addEventListener('click', () => {
    state.stage = button.dataset.stage;
    renderQuestions();
  }));
  $('#startLocalBtn').addEventListener('click', () => {
    if (hasCurrentAssessmentData() && !window.confirm('开始新测评会清除当前页面中的 CPQ、ECR-R、DCI、CSI、Sex Sub、RFS 和观察数据。请先下载纵向档案。确定继续吗？')) return;
    localStorage.removeItem('cpqSessionV2');
    resetAssessment('local');
    activateTab('questionnaire');
    setMessage('#questionnaireMessage', '新的本地测评已开始，请由伴侣 A 独立作答。');
  });
  $('#clearAnswersBtn').addEventListener('click', () => {
    if (isLocked(state.respondent)) return;
    if (!window.confirm(`确定清空伴侣 ${state.respondent} 当前的全部答案吗？`)) return;
    state.answers[state.respondent] = blankAnswers();
    if (state.session.mode === 'cloud') {
      cpqDraftRevision += 1;
      cpqSyncError = '';
      state.cloudProgress.cpq[state.respondent] = 0;
    }
    renderQuestions();
    scheduleCloudDraft();
  });
  $('#saveDraftBtn').addEventListener('click', () => saveAnswers(false));
  $('#submitAnswersBtn').addEventListener('click', () => saveAnswers(true));
  $('#exportBtn').addEventListener('click', exportResults);
  $('#ecrPerson').addEventListener('change', event => {
    state.ecrPerson = event.target.value;
    renderEcr();
  });
  $('#submitEcrBtn').addEventListener('click', submitEcr);
  $('#clearEcrBtn').addEventListener('click', () => {
    const person = state.ecrPerson;
    if (state.ecrSubmitted[person] || !window.confirm(`确定清空伴侣 ${person} 的全部 ECR-R 答案吗？`)) return;
    state.ecrAnswers[person] = blankEcrAnswers();
    renderEcr();
    scheduleSupplementalDraft('ecr');
  });
  $('#dciPerson').addEventListener('change', event => {
    state.dciPerson = event.target.value;
    renderDci();
  });
  $('#submitDciBtn').addEventListener('click', submitDci);
  $('#clearDciBtn').addEventListener('click', () => {
    const person = state.dciPerson;
    if (state.dciSubmitted[person]) return;
    if (!window.confirm(`确定清空伴侣 ${person} 的 DCI 答案和录入分数吗？`)) return;
    state.dciAnswers[person] = blankDciAnswers();
    state.dciScores[person] = blankDciScores();
    state.dciSubmitted[person] = false;
    renderDci();
    scheduleSupplementalDraft('dci');
    setMessage('#dciMessage', `已清空伴侣 ${person} 的 DCI 数据。`);
  });
  for (const [measure, definition] of Object.entries(relationshipMeasureDefinitions)) {
    const prefix = measure[0].toUpperCase() + measure.slice(1);
    $(`#${measure}Person`).addEventListener('change', event => {
      state.relationshipMeasures[measure].person = event.target.value;
      renderRelationshipMeasure(measure);
    });
    $(`#submit${prefix}Btn`).addEventListener('click', () => submitRelationshipMeasure(measure));
    $(`#clear${prefix}Btn`).addEventListener('click', () => {
      const model = state.relationshipMeasures[measure];
      const person = model.person;
      if (model.submitted[person] || !window.confirm(`确定清空伴侣 ${person} 的全部 ${definition.label} 答案吗？`)) return;
      model.answers[person] = blankScaleAnswers(definition.items.length);
      state.cloudProgress[measure][person] = 0;
      renderRelationshipMeasure(measure);
      scheduleSupplementalDraft(measure);
    });
  }
  $('#promisPerson').addEventListener('change', event => {
    state.promisSexFs.person = event.target.value;
    renderPromisSexFs();
  });
  $('#promisProfileSelect').addEventListener('change', event => {
    const model = state.promisSexFs;
    const person = model.person;
    const current = model.responses[person];
    const hasAnswers = Object.values(current.answers).some(Number.isFinite) || current.reasons.length;
    if (hasAnswers && !window.confirm('切换身体相关域会清空当前 PROMIS SexFS 草稿。确定继续吗？')) {
      event.target.value = current.profile;
      return;
    }
    model.responses[person] = blankPromisSexFsResponse(event.target.value);
    state.cloudProgress.promis[person] = 0;
    renderPromisSexFs();
    scheduleSupplementalDraft('promis');
  });
  $('#submitPromisBtn').addEventListener('click', submitPromisSexFs);
  $('#clearPromisBtn').addEventListener('click', () => {
    const model = state.promisSexFs;
    const person = model.person;
    if (model.submitted[person] || !window.confirm(`确定清空伴侣 ${person} 的全部 PROMIS SexFS 答案吗？`)) return;
    model.responses[person] = blankPromisSexFsResponse(model.responses[person].profile);
    state.cloudProgress.promis[person] = 0;
    renderPromisSexFs();
    scheduleSupplementalDraft('promis');
  });
  $('#exportLongitudinalBtn').addEventListener('click', exportLongitudinalRecord);
  $('#longitudinalFiles').addEventListener('change', event => importLongitudinalFiles(event.target.files));
  $('#longitudinalCouple').addEventListener('change', renderLongitudinal);
  $('#clearLongitudinalBtn').addEventListener('click', () => {
    state.importedRecords = [];
    renderLongitudinal();
    setMessage('#longitudinalImportMessage', '已清空当前浏览器中载入的档案；原始本地文件未被删除。');
  });
  $('#createSessionBtn').addEventListener('click', createCloudSession);
  $('#retryCloudBtn').addEventListener('click', async () => {
    const ready = await checkCloudAvailability();
    if (ready && state.session.mode === 'cloud') await refreshCloudSession();
  });
  $('#generatePinBtn').addEventListener('click', async () => {
    try {
      const pin = generateNumericPin();
      $('#createPin').value = pin;
      const copied = await copyText(pin);
      setMessage('#sessionMessage', copied ? '已安全生成并复制 10 位 PIN。' : '已安全生成 10 位 PIN；剪贴板不可用，请显示后手动复制。');
    } catch (error) {
      setMessage('#sessionMessage', `PIN 生成失败：${error.message}`);
    }
  });
  $('#togglePinBtn').addEventListener('click', event => {
    const showing = $('#createPin').type === 'text';
    $('#createPin').type = showing ? 'password' : 'text';
    event.currentTarget.textContent = showing ? '显示' : '隐藏';
    event.currentTarget.setAttribute('aria-pressed', String(!showing));
  });
  $('#joinSessionBtn').addEventListener('click', joinCloudSession);
  $('#refreshSessionBtn').addEventListener('click', refreshCloudSession);
  $('#copyCodeBtn').addEventListener('click', async () => {
    const copied = await copyText(state.session.code);
    setMessage('#sessionMessage', copied ? '邀请码已复制；请通过另一个可信渠道告知 PIN。' : `邀请码：${state.session.code}`);
  });
  $('#copyPinBtn').addEventListener('click', async () => {
    if (!state.session.invitePin) return;
    const copied = await copyText(state.session.invitePin);
    setMessage('#sessionMessage', copied ? 'PIN 已复制；刷新页面后将无法再次读取。' : '剪贴板不可用，请返回创建区手动复制。');
  });
  $('#leaveSessionBtn').addEventListener('click', leaveCloudSession);
  $('#deleteSessionBtn').addEventListener('click', deleteCloudSession);
  $('#stopObservationBtn').addEventListener('click', stopObservation);
  $('#clearObservationBtn').addEventListener('click', () => {
    if (!window.confirm('确定清空全部观察记录吗？')) return;
    state.events = [];
    renderObservation();
    syncObservation();
  });
  $('#spaffPerson').addEventListener('change', renderSpaffRatings);
  $('#clearSpaffRatingBtn').addEventListener('click', () => {
    const person = $('#spaffPerson').value;
    if (!window.confirm(`确定清空伴侣 ${person} 的 9 维整体评级吗？`)) return;
    state.spaffRatings[person] = blankSpaffRatings();
    renderSpaffRatings();
    syncObservation();
  });
}

setupTabs();
setupObservation();
setupActions();
if (!$('#assessmentDate').value) {
  const now = new Date();
  $('#assessmentDate').value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
const restoredCloudSession = loadSessionToken();
renderAll();
checkCloudAvailability().then(ready => {
  if (ready && restoredCloudSession) refreshCloudSession();
});
setInterval(() => {
  if (state.events.some(event => event.endMs === null)) renderObservation();
}, 1000);
setInterval(() => {
  if (document.visibilityState === 'visible' && cloudReady() && state.session.mode === 'cloud') {
    refreshCloudSession({ silent: true });
  }
}, 2000);
