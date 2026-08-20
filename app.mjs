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

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const blankAnswers = () => Array(35).fill(null);
const cfg = window.CPQ_SUPABASE || {};
const divorceModelConfig = window.CPQ_DIVORCE_MODEL || null;

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

const state = {
  respondent: 'A',
  stage: 'emergence',
  answers: { A: blankAnswers(), B: blankAnswers() },
  submitted: { A: false, B: false },
  session: { mode: 'local', code: null, role: null, token: null, invitePin: null },
  events: [],
  spaffRatings: { A: blankSpaffRatings(), B: blankSpaffRatings() }
};

let draftTimer = null;

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (_) {
    return false;
  }
}

function cloudReady() {
  return Boolean(cfg.url && cfg.anonKey);
}

function setMessage(selector, message) {
  $(selector).textContent = message || '';
}

function activateTab(name) {
  $$('.tab').forEach(button => button.classList.toggle('active', button.dataset.tab === name));
  $$('.panel').forEach(panel => panel.classList.toggle('active', panel.id === name));
  const panel = document.getElementById(name);
  if (panel) panel.focus({ preventScroll: true });
  if (name === 'results') renderResults();
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
  if (mode === 'local') state.session = { mode: 'local', code: null, role: null, token: null, invitePin: null };
  renderAll();
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
    const inspection = inspectAnswers(state.answers[person]);
    $(`#progress${person}`).textContent = `${inspection.answered}/35${state.submitted[person] ? ' · 已锁定' : ''}`;
  }
  const current = inspectAnswers(state.answers[state.respondent]);
  $('#currentRespondent').textContent = state.respondent;
  $('#currentStage').textContent = CPQ_STAGES[state.stage].zh;
  $('#progressBar').style.width = `${Math.round(current.answered / 35 * 100)}%`;
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
  $('#submitAnswersBtn').disabled = locked;
  $('#clearAnswersBtn').disabled = locked;
  $$('.stage').forEach(button => button.classList.toggle('active', button.dataset.stage === state.stage));
  renderProgress();
  if (locked) setMessage('#questionnaireMessage', `伴侣 ${state.respondent} 的答案已提交并锁定。`);
}

function renderSession() {
  const active = state.session.mode === 'cloud' && state.session.code;
  $('#activeSession').hidden = !active;
  $('#cloudStatus').textContent = cloudReady() ? 'Supabase 已配置' : '未配置 · 使用本地模式';
  $('#cloudDot').classList.toggle('ok', cloudReady());
  $('#privacyBadge').textContent = active ? '云同步会话' : '本地模式';
  $('#copyPinBtn').hidden = !(active && state.session.role === 'A' && state.session.invitePin);
  if (active) {
    $('#activeCode').textContent = state.session.code;
    $('#activeRole').textContent = state.session.role;
    $('#submitA').textContent = state.submitted.A ? '已锁定' : '未提交';
    $('#submitB').textContent = state.submitted.B ? '已锁定' : '未提交';
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
    $('#resultGate').textContent = `等待双方完成并提交。A：${A.answered}/35${state.submitted.A ? '，已锁定' : ''}；B：${B.answered}/35${state.submitted.B ? '，已锁定' : ''}。`;
    return;
  }

  const scoreRows = [];
  for (const [key, definition] of Object.entries(CPQ_SCORING)) {
    const row = document.createElement('tr');
    const label = document.createElement('th');
    label.scope = 'row';
    label.textContent = `${definition.labelZh} / ${definition.labelEn}`;
    const range = document.createElement('td');
    range.textContent = `${definition.min}–${definition.max}`;
    row.append(label, range);
    appendScoreCell(row, dyad.A.scores[key]);
    appendScoreCell(row, dyad.B.scores[key]);
    scoreRows.push(row);
  }
  $('#scoreRows').replaceChildren(...scoreRows);

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
      return true;
    }
  } catch (_) {
    localStorage.removeItem('cpqSessionV2');
  }
  return false;
}

async function rpc(name, body) {
  if (!cloudReady()) throw new Error('Supabase 尚未配置。');
  const response = await fetch(`${cfg.url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cfg.anonKey,
      Authorization: `Bearer ${cfg.anonKey}`
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  if (!response.ok) {
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `HTTP ${response.status}`);
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error(text || `HTTP ${response.status}`);
      throw error;
    }
  }
  const data = text ? JSON.parse(text) : null;
  if (data && data.error) throw new Error(data.error);
  return data;
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

async function refreshCloudSession() {
  if (state.session.mode !== 'cloud') return;
  try {
    const data = await rpc('get_couple_session', { p_code: state.session.code, p_token: state.session.token });
    state.submitted.A = Boolean(data.submittedA);
    state.submitted.B = Boolean(data.submittedB);
    state.answers[state.session.role] = normalizeAnswers(data.myAnswers);
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
    renderAll();
    setMessage('#sessionMessage', state.submitted.A && state.submitted.B ? '双方已提交，标准结果已解锁。' : '同步完成。');
  } catch (error) {
    setMessage('#sessionMessage', `同步失败：${error.message}`);
  }
}

async function saveAnswers(submit = false) {
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
      if (person === 'B') activateTab('results');
    } else {
      setMessage('#questionnaireMessage', '答案已暂存在当前页面；刷新页面会清除本地数据。');
    }
    return;
  }
  if (person !== state.session.role) return;
  try {
    setMessage('#questionnaireMessage', submit ? '正在提交并锁定…' : '正在保存草稿…');
    await rpc('save_couple_answers', {
      p_code: state.session.code,
      p_token: state.session.token,
      p_answers: state.answers[person],
      p_submit: submit
    });
    if (submit) state.submitted[person] = true;
    renderAll();
    setMessage('#questionnaireMessage', submit ? '提交成功，答案已锁定。' : '云端草稿已保存。');
    if (submit) await refreshCloudSession();
  } catch (error) {
    setMessage('#questionnaireMessage', `保存失败：${error.message}`);
  }
}

function scheduleCloudDraft() {
  if (state.session.mode !== 'cloud' || isLocked(state.respondent)) return;
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => saveAnswers(false), 1000);
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

function exportResults() {
  const dyad = scoreDyad(state.answers.A, state.answers.B);
  if (!dyad.complete || !state.submitted.A || !state.submitted.B) return;
  const communicationStrain = computeCommunicationStrain(dyad);
  const divorceProbability = evaluateDivorceProbability(
    { cpqCommunicationStrain: communicationStrain.value },
    divorceModelConfig
  );
  const payload = {
    schemaVersion: '2.2',
    instrument: CPQ_VERSION,
    scoring: 'Crenshaw et al. (2017), summed subscales; items 1, 24, and 26 reverse-scored as 10 - response',
    answers: state.answers,
    scores: { A: dyad.A.scores, B: dyad.B.scores },
    pairedReports: dyad.comparisons,
    derivedResearch: {
      communicationStrain,
      divorceProbability
    },
    observation: {
      macroAffectEvents: state.events,
      spaffInformedRatings: state.spaffRatings,
      status: 'Exploratory only; not a complete or validated SPAFF implementation'
    },
    exportedAt: new Date().toISOString()
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cpq-35-results.json';
  link.click();
  URL.revokeObjectURL(url);
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
  renderResults();
  renderObservation();
}

function setupActions() {
  $('#respondentSelect').addEventListener('change', event => setRespondent(event.target.value));
  $$('.stage').forEach(button => button.addEventListener('click', () => {
    state.stage = button.dataset.stage;
    renderQuestions();
  }));
  $('#startLocalBtn').addEventListener('click', () => {
    if ((inspectAnswers(state.answers.A).answered || inspectAnswers(state.answers.B).answered) && !window.confirm('开始新测评会清除当前页面中的答案。确定继续吗？')) return;
    localStorage.removeItem('cpqSessionV2');
    resetAssessment('local');
    activateTab('questionnaire');
    setMessage('#questionnaireMessage', '新的本地测评已开始，请由伴侣 A 独立作答。');
  });
  $('#clearAnswersBtn').addEventListener('click', () => {
    if (isLocked(state.respondent)) return;
    if (!window.confirm(`确定清空伴侣 ${state.respondent} 当前的全部答案吗？`)) return;
    state.answers[state.respondent] = blankAnswers();
    renderQuestions();
  });
  $('#saveDraftBtn').addEventListener('click', () => saveAnswers(false));
  $('#submitAnswersBtn').addEventListener('click', () => saveAnswers(true));
  $('#exportBtn').addEventListener('click', exportResults);
  $('#createSessionBtn').addEventListener('click', createCloudSession);
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
renderAll();
if (loadSessionToken() && cloudReady()) refreshCloudSession();
setInterval(() => {
  if (state.events.some(event => event.endMs === null)) renderObservation();
}, 1000);
