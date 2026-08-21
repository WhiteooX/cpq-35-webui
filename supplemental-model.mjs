const freezeItems = items => Object.freeze(items.map(item => Object.freeze(item)));
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const round2 = value => Math.round(value * 100) / 100;

export const ECR_R_VERSION = 'ECR-R 36 · Fraley, Waller, & Brennan (2000)';

export const ECR_R_ITEMS = freezeItems([
  { id: 1, en: "I'm afraid that I will lose my partner's love.", zh: '我害怕会失去伴侣的爱。' },
  { id: 2, en: 'I often worry that my partner will not want to stay with me.', zh: '我经常担心伴侣不愿继续和我在一起。' },
  { id: 3, en: "I often worry that my partner doesn't really love me.", zh: '我经常担心伴侣并不真正爱我。' },
  { id: 4, en: 'I worry that romantic partners won’t care about me as much as I care about them.', zh: '我担心恋爱伴侣对我的在意不如我对他们的在意。' },
  { id: 5, en: "I often wish that my partner's feelings for me were as strong as my feelings for him or her.", zh: '我常希望伴侣对我的感情能像我对其感情一样强烈。' },
  { id: 6, en: 'I worry a lot about my relationships.', zh: '我非常担心自己的亲密关系。' },
  { id: 7, en: 'When my partner is out of sight, I worry that he or she might become interested in someone else.', zh: '伴侣不在身边时，我担心其会对别人产生兴趣。' },
  { id: 8, en: "When I show my feelings for romantic partners, I'm afraid they will not feel the same about me.", zh: '当我向恋爱伴侣表达感情时，我害怕对方没有同样的感受。' },
  { id: 9, en: 'I rarely worry about my partner leaving me.', zh: '我很少担心伴侣离开我。' },
  { id: 10, en: 'My romantic partner makes me doubt myself.', zh: '我的恋爱伴侣会让我怀疑自己。' },
  { id: 11, en: 'I do not often worry about being abandoned.', zh: '我不常担心被抛弃。' },
  { id: 12, en: "I find that my partner(s) don't want to get as close as I would like.", zh: '我觉得伴侣不愿意像我希望的那样与我亲近。' },
  { id: 13, en: 'Sometimes romantic partners change their feelings about me for no apparent reason.', zh: '有时恋爱伴侣会无缘无故改变对我的感情。' },
  { id: 14, en: 'My desire to be very close sometimes scares people away.', zh: '我想要非常亲近的愿望有时会把别人吓跑。' },
  { id: 15, en: "I'm afraid that once a romantic partner gets to know me, he or she won't like who I really am.", zh: '我害怕恋爱伴侣真正了解我后不会喜欢真实的我。' },
  { id: 16, en: "It makes me mad that I don't get the affection and support I need from my partner.", zh: '无法从伴侣那里获得所需的关爱和支持会令我生气。' },
  { id: 17, en: "I worry that I won't measure up to other people.", zh: '我担心自己比不上别人。' },
  { id: 18, en: 'My partner only seems to notice me when I’m angry.', zh: '伴侣似乎只有在我生气时才会注意到我。' },
  { id: 19, en: 'I prefer not to show a partner how I feel deep down.', zh: '我更愿意不让伴侣知道我内心深处的感受。' },
  { id: 20, en: 'I feel comfortable sharing my private thoughts and feelings with my partner.', zh: '我能自在地与伴侣分享私密想法和感受。' },
  { id: 21, en: 'I find it difficult to allow myself to depend on romantic partners.', zh: '我发现让自己依赖恋爱伴侣很困难。' },
  { id: 22, en: 'I am very comfortable being close to romantic partners.', zh: '我对与恋爱伴侣亲近感到非常自在。' },
  { id: 23, en: "I don't feel comfortable opening up to romantic partners.", zh: '我对向恋爱伴侣敞开心扉感到不自在。' },
  { id: 24, en: 'I prefer not to be too close to romantic partners.', zh: '我倾向于不与恋爱伴侣过于亲近。' },
  { id: 25, en: 'I get uncomfortable when a romantic partner wants to be very close.', zh: '恋爱伴侣想要非常亲近时，我会感到不舒服。' },
  { id: 26, en: 'I find it relatively easy to get close to my partner.', zh: '我觉得与伴侣亲近相对容易。' },
  { id: 27, en: "It's not difficult for me to get close to my partner.", zh: '对我来说，与伴侣亲近并不困难。' },
  { id: 28, en: 'I usually discuss my problems and concerns with my partner.', zh: '我通常会和伴侣讨论自己的问题和担忧。' },
  { id: 29, en: 'It helps to turn to my romantic partner in times of need.', zh: '需要帮助时向恋爱伴侣求助对我有帮助。' },
  { id: 30, en: 'I tell my partner just about everything.', zh: '我几乎什么都会告诉伴侣。' },
  { id: 31, en: 'I talk things over with my partner.', zh: '我会与伴侣商量事情。' },
  { id: 32, en: 'I am nervous when partners get too close to me.', zh: '伴侣与我过于亲近时，我会紧张。' },
  { id: 33, en: 'I feel comfortable depending on romantic partners.', zh: '我对依赖恋爱伴侣感到自在。' },
  { id: 34, en: 'I find it easy to depend on romantic partners.', zh: '我觉得依赖恋爱伴侣很容易。' },
  { id: 35, en: "It's easy for me to be affectionate with my partner.", zh: '我很容易向伴侣表达亲昵。' },
  { id: 36, en: 'My partner really understands me and my needs.', zh: '我的伴侣真正理解我和我的需要。' }
]);

const ECR_ANXIETY_REVERSED = new Set([9, 11]);
const ECR_AVOIDANCE_REVERSED = new Set([20, 22, 26, 27, 28, 29, 30, 31, 33, 34, 35, 36]);

export function blankEcrAnswers() {
  return Array(36).fill(null);
}

export function inspectEcrAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== 36) {
    return Object.freeze({ complete: false, answered: 0, missing: ECR_R_ITEMS.map(item => item.id), invalid: ['shape'] });
  }
  const missing = [];
  const invalid = [];
  answers.forEach((answer, index) => {
    if (answer === null || answer === undefined || answer === '') missing.push(index + 1);
    else if (!Number.isInteger(answer) || answer < 1 || answer > 7) invalid.push(index + 1);
  });
  return Object.freeze({ complete: !missing.length && !invalid.length, answered: 36 - missing.length, missing, invalid });
}

export function scoreEcrR(answers) {
  const inspection = inspectEcrAnswers(answers);
  if (!inspection.complete) return Object.freeze({ complete: false, inspection });
  const keyed = answers.map((answer, index) => {
    const id = index + 1;
    return ECR_ANXIETY_REVERSED.has(id) || ECR_AVOIDANCE_REVERSED.has(id) ? 8 - answer : answer;
  });
  return Object.freeze({
    complete: true,
    version: ECR_R_VERSION,
    anxiety: round2(mean(keyed.slice(0, 18))),
    avoidance: round2(mean(keyed.slice(18, 36))),
    range: Object.freeze([1, 7]),
    interpretation: 'Continuous dimensions only; no categorical attachment-style diagnosis'
  });
}

export const DCI_SCORE_FIELDS = Object.freeze({
  selfStressCommunication: Object.freeze({ label: '自己的压力沟通', min: 4, max: 20 }),
  selfSupportive: Object.freeze({ label: '自己的支持性共同应对', min: 5, max: 25 }),
  selfDelegated: Object.freeze({ label: '自己的委托式共同应对', min: 2, max: 10 }),
  selfNegative: Object.freeze({ label: '自己的消极共同应对', min: 4, max: 20 }),
  partnerStressCommunication: Object.freeze({ label: '对伴侣压力沟通的评价', min: 4, max: 20 }),
  partnerSupportive: Object.freeze({ label: '对伴侣支持性共同应对的评价', min: 5, max: 25 }),
  partnerDelegated: Object.freeze({ label: '对伴侣委托式共同应对的评价', min: 2, max: 10 }),
  partnerNegative: Object.freeze({ label: '对伴侣消极共同应对的评价', min: 4, max: 20 }),
  common: Object.freeze({ label: '共同应对', min: 5, max: 25 }),
  totalWithoutEvaluation: Object.freeze({ label: 'DCI 总分（不含评价题）', min: 35, max: 175 }),
  satisfaction: Object.freeze({ label: '对应对的满意度', min: 1, max: 5 }),
  effectiveness: Object.freeze({ label: '对应对效果的评价', min: 1, max: 5 })
});

export function blankDciScores() {
  return Object.fromEntries(Object.keys(DCI_SCORE_FIELDS).map(key => [key, null]));
}

export function validateDciScores(scores) {
  const normalized = blankDciScores();
  const invalid = [];
  for (const [key, definition] of Object.entries(DCI_SCORE_FIELDS)) {
    const raw = scores?.[key];
    if (raw === null || raw === undefined || raw === '') continue;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < definition.min || value > definition.max) invalid.push(key);
    else normalized[key] = value;
  }
  const available = Object.values(normalized).some(Number.isFinite);
  return Object.freeze({ available, valid: !invalid.length, invalid, scores: Object.freeze(normalized) });
}

const DCI_SUBSCALES = new Set(Object.keys(DCI_SCORE_FIELDS).filter(key => !['totalWithoutEvaluation', 'satisfaction', 'effectiveness'].includes(key)));

export function validateDciItemBank(bank) {
  if (!bank || bank.authorizationConfirmed !== true) return Object.freeze({ valid: false, reason: 'No authorized DCI item bank is configured' });
  if (!Array.isArray(bank.items) || bank.items.length !== 37) return Object.freeze({ valid: false, reason: 'DCI item bank must contain exactly 37 items' });
  const ids = new Set();
  for (const item of bank.items) {
    if (!Number.isInteger(item.id) || item.id < 1 || item.id > 37 || ids.has(item.id) || typeof item.text !== 'string' || !item.text.trim()) {
      return Object.freeze({ valid: false, reason: 'DCI item metadata is invalid' });
    }
    if (item.id <= 35 && !DCI_SUBSCALES.has(item.subscale)) return Object.freeze({ valid: false, reason: `Invalid DCI subscale for item ${item.id}` });
    ids.add(item.id);
  }
  return Object.freeze({ valid: true, version: bank.version, language: bank.language });
}

export function scoreAuthorizedDci(answers, bank) {
  const validation = validateDciItemBank(bank);
  if (!validation.valid) return Object.freeze({ complete: false, reason: validation.reason });
  if (!Array.isArray(answers) || answers.length !== 37 || answers.some(value => !Number.isInteger(value) || value < 1 || value > 5)) {
    return Object.freeze({ complete: false, reason: 'All 37 DCI items require integer responses from 1 to 5' });
  }
  const grouped = Object.fromEntries([...DCI_SUBSCALES].map(key => [key, []]));
  const scoredById = Object.fromEntries(bank.items.map(item => {
    const answer = answers[item.id - 1];
    return [item.id, item.reverse ? 6 - answer : answer];
  }));
  bank.items.forEach(item => {
    if (item.id <= 35) grouped[item.subscale].push(scoredById[item.id]);
  });
  const subscales = Object.fromEntries(Object.entries(grouped).map(([key, values]) => [key, values.reduce((sum, value) => sum + value, 0)]));
  return Object.freeze({
    complete: true,
    version: bank.version,
    scores: Object.freeze({
      ...subscales,
      totalWithoutEvaluation: Array.from({ length: 35 }, (_, index) => scoredById[index + 1]).reduce((sum, value) => sum + value, 0),
      satisfaction: answers[35],
      effectiveness: answers[36]
    })
  });
}
