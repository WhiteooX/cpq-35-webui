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

export const DCI_CANONICAL_KEY = Object.freeze({
  selfStressCommunication: Object.freeze([1, 2, 3, 4]),
  selfSupportive: Object.freeze([20, 21, 23, 24, 29]),
  selfDelegated: Object.freeze([28, 30]),
  selfNegative: Object.freeze([22, 25, 26, 27]),
  partnerStressCommunication: Object.freeze([16, 17, 18, 19]),
  partnerSupportive: Object.freeze([5, 6, 8, 9, 13]),
  partnerDelegated: Object.freeze([12, 14]),
  partnerNegative: Object.freeze([7, 10, 11, 15]),
  common: Object.freeze([31, 32, 33, 34, 35])
});

const DCI_SUBSCALE_BY_ID = new Map(
  Object.entries(DCI_CANONICAL_KEY).flatMap(([subscale, ids]) => ids.map(id => [id, subscale]))
);
const DCI_REVERSED_IDS = new Set([7, 10, 11, 15, 22, 25, 26, 27]);

export function validateDciItemBank(bank) {
  if (!bank || bank.authorizationConfirmed !== true) return Object.freeze({ valid: false, reason: 'No authorized DCI item bank is configured' });
  if (!Array.isArray(bank.items) || bank.items.length !== 37) return Object.freeze({ valid: false, reason: 'DCI item bank must contain exactly 37 items' });
  const ids = new Set();
  for (const item of bank.items) {
    if (!Number.isInteger(item.id) || item.id < 1 || item.id > 37 || ids.has(item.id) || typeof item.text !== 'string' || !item.text.trim()) {
      return Object.freeze({ valid: false, reason: 'DCI item metadata is invalid' });
    }
    if (item.id <= 35 && item.subscale !== DCI_SUBSCALE_BY_ID.get(item.id)) {
      return Object.freeze({ valid: false, reason: `DCI subscale key does not match the official scoring key for item ${item.id}` });
    }
    if (Boolean(item.reverse) !== DCI_REVERSED_IDS.has(item.id)) {
      return Object.freeze({ valid: false, reason: `DCI reverse key does not match the official scoring key for item ${item.id}` });
    }
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

export const CSI_32_VERSION = 'Couples Satisfaction Index (CSI-32) · Funk & Rogge (2007)';

const CSI_TEXT = [
  ['综合考虑，请评价你目前关系的幸福程度。', 'Please indicate the degree of happiness, all things considered, of your relationship.'],
  ['你和伴侣在共处时间多少方面的一致程度。', 'Amount of time spent together.'],
  ['你和伴侣在重大决定方面的一致程度。', 'Making major decisions.'],
  ['你和伴侣在表达爱意方面的一致程度。', 'Demonstrations of affection.'],
  ['总体而言，你多常觉得你和伴侣之间一切进展顺利？', 'In general, how often do you think that things between you and your partner are going well?'],
  ['你多常希望自己当初没有进入这段关系？', "How often do you wish you hadn't gotten into this relationship?"],
  ['我仍然感到自己与伴侣有很强的联结。', 'I still feel a strong connection with my partner.'],
  ['如果人生重来一次，我仍会与同一个人结婚（或共同生活／约会）。', 'If I had my life to live over, I would marry (or live with/date) the same person.'],
  ['我们的关系很牢固。', 'Our relationship is strong.'],
  ['我有时会想，是否还有别的人更适合我。', 'I sometimes wonder if there is someone else out there for me.'],
  ['我和伴侣的关系令我快乐。', 'My relationship with my partner makes me happy.'],
  ['我和伴侣之间的关系温暖而舒适。', 'I have a warm and comfortable relationship with my partner.'],
  ['我无法想象结束与伴侣的关系。', "I can't imagine ending my relationship with my partner."],
  ['我觉得几乎任何事情都可以向伴侣倾诉。', 'I feel that I can confide in my partner about virtually anything.'],
  ['最近我曾对这段关系产生过动摇。', 'I have had second thoughts about this relationship recently.'],
  ['对我而言，伴侣是理想的浪漫伴侣。', 'For me, my partner is the perfect romantic partner.'],
  ['我确实觉得自己和伴侣是一个团队。', 'I really feel like part of a team with my partner.'],
  ['我无法想象另一个人能像伴侣一样令我快乐。', 'I cannot imagine another person making me as happy as my partner does.'],
  ['你与伴侣的关系对你而言有多值得？', 'How rewarding is your relationship with your partner?'],
  ['伴侣满足你需要的程度如何？', 'How well does your partner meet your needs?'],
  ['这段关系在多大程度上符合你最初的期待？', 'To what extent has your relationship met your original expectations?'],
  ['总体而言，你对这段关系有多满意？', 'In general, how satisfied are you with your relationship?'],
  ['与大多数关系相比，你们的关系有多好？', 'How good is your relationship compared to most?'],
  ['你享受伴侣的陪伴吗？', "Do you enjoy your partner's company?"],
  ['你和伴侣多常一起度过愉快时光？', 'How often do you and your partner have fun together?'],
  ['无聊 — 有趣', 'Boring — Interesting'],
  ['糟糕 — 良好', 'Bad — Good'],
  ['空虚 — 充实', 'Empty — Full'],
  ['孤独 — 友好亲密', 'Lonely — Friendly'],
  ['脆弱 — 稳固', 'Fragile — Sturdy'],
  ['令人泄气 — 充满希望', 'Discouraging — Hopeful'],
  ['痛苦 — 愉快', 'Miserable — Enjoyable']
];

export const CSI_32_ITEMS = freezeItems(CSI_TEXT.map(([zh, en], index) => ({
  id: index + 1,
  zh,
  en,
  min: 0,
  max: index === 0 ? 6 : 5,
  reverse: [6, 10, 15].includes(index + 1),
  kind: index === 0 ? 'happiness' : index < 4 ? 'agreement' : index < 6 ? 'frequency' : index < 18 ? 'truth' : index < 25 ? 'evaluation' : 'semantic'
})));

export const GMSEX_VERSION = 'Global Measure of Sexual Satisfaction (GMSEX) · Lawrance & Byers (1995)';
export const GMSEX_ITEMS = freezeItems([
  { id: 1, zh: '糟糕 — 良好', en: 'Bad — Good' },
  { id: 2, zh: '不愉快 — 愉快', en: 'Unpleasant — Pleasant' },
  { id: 3, zh: '消极 — 积极', en: 'Negative — Positive' },
  { id: 4, zh: '不满意 — 满意', en: 'Unsatisfying — Satisfying' },
  { id: 5, zh: '毫无价值 — 有价值', en: 'Worthless — Valuable' }
]);

export const NSSS_S_VERSION = 'New Sexual Satisfaction Scale–Short Form (NSSS-S, 12 items) · Štulhofer et al. (2010)';
export const NSSS_S_ITEMS = freezeItems([
  { id: 1, zh: '我的性高潮质量。', en: 'The quality of my orgasms.' },
  { id: 2, zh: '在性活动中，我能够“放开自己”并投入性愉悦的程度。', en: 'My “letting go” and surrender to sexual pleasure during sex.' },
  { id: 3, zh: '我对伴侣作出性反应的方式。', en: 'The way I sexually react to my partner.' },
  { id: 4, zh: '我身体的性功能表现。', en: 'My body’s sexual functioning.' },
  { id: 5, zh: '性活动后我的心情。', en: 'My mood after sexual activity.' },
  { id: 6, zh: '我带给伴侣的愉悦。', en: 'The pleasure I provide to my partner.' },
  { id: 7, zh: '性生活中付出与获得之间的平衡。', en: 'The balance between what I give and receive in sex.' },
  { id: 8, zh: '伴侣在性活动中的情感开放程度。', en: 'My partner’s emotional opening up during sex.' },
  { id: 9, zh: '伴侣达到性高潮的能力。', en: 'My partner’s ability to orgasm.' },
  { id: 10, zh: '伴侣在性方面的创造性。', en: 'My partner’s sexual creativity.' },
  { id: 11, zh: '我的性活动种类。', en: 'The variety of my sexual activities.' },
  { id: 12, zh: '我的性活动频率。', en: 'The frequency of my sexual activity.' }
]);

export const KOS_VERSION = 'Kink Orientation Scale (KOS, 18 items) · Wignall et al. (2024)';
export const KOS_FACTOR_LABELS = Object.freeze({
  identity: 'Kink 认同',
  practices: 'Kink 实践／兴趣',
  paraphernalia: '相关物品与场所',
  community: '社群与交流',
  communication: '性沟通'
});
export const KOS_ITEMS = freezeItems([
  { id: 1, factor: 'identity', zh: '我会把自己描述为 kinky（有 kink 倾向）。', en: 'I would describe myself as kinky.' },
  { id: 2, factor: 'identity', zh: '我是某个性亚文化的一员。', en: 'I am part of a sexual subculture.' },
  { id: 3, factor: 'identity', zh: '朋友会把我描述为 kinky。', en: 'My friends describe me as kinky.' },
  { id: 4, factor: 'practices', zh: '我的性兴趣一直在变化发展。', en: 'My sexual interests are constantly evolving.' },
  { id: 5, factor: 'practices', zh: '我的性兴趣可能包含风险。', en: 'My sexual interests can be risky.' },
  { id: 6, factor: 'practices', zh: '在性情境中，疼痛可以是有趣或愉悦的。', en: 'Pain can be fun in a sexual context.' },
  { id: 7, factor: 'practices', zh: '我有较小众的性兴趣。', en: 'I have niche sexual interests.' },
  { id: 8, factor: 'paraphernalia', zh: '性玩具在性活动中对我很重要。', en: 'Sex toys are important in sex.' },
  { id: 9, factor: 'paraphernalia', zh: '我可以自在地逛成人用品商店（线下或线上）。', en: 'I feel comfortable visiting a sex shop (offline and online).' },
  { id: 10, factor: 'community', zh: '我研究过自己的性兴趣。', en: 'I have researched my sexual interests.' },
  { id: 11, factor: 'community', zh: '我经常与性伴侣谈论自己的性兴趣。', en: 'I often talk about my sexual interests with my sexual partner.' },
  { id: 12, factor: 'community', zh: '我认识与我有相同性兴趣的人。', en: 'I know others with the same sexual interests as me.' },
  { id: 13, factor: 'community', zh: '我有在性活动时穿着的特定服装。', en: 'I have outfits I wear when having sex.' },
  { id: 14, factor: 'practices', zh: '我喜欢在性活动中包含权力动态。', en: 'I like my sex to incorporate a power dynamic.' },
  { id: 15, factor: 'communication', zh: '与某人发生性行为前先交谈很重要。', en: 'It’s important to chat with somebody before having sex with them.' },
  { id: 16, factor: 'communication', zh: '随意性行为是有趣的。', en: 'Casual sex is fun.' },
  { id: 17, factor: 'communication', zh: '与性伴侣有“化学反应”很重要。', en: 'Having chemistry with sexual partner is important.' },
  { id: 18, factor: 'paraphernalia', zh: '我可以自在地从成人用品商店购买物品（线下或线上）。', en: 'I feel comfortable purchasing items from a sex shop (offline and online).' }
]);

export const PROMIS_SEXFS_VERSION = 'PROMIS Sexual Function and Satisfaction v2.0 Brief Profiles';
export const PROMIS_SEXFS_PROFILES = Object.freeze({
  vaginal: Object.freeze({ label: '阴道／外阴相关域', formItems: 14 }),
  erectile: Object.freeze({ label: '勃起相关域', formItems: 10 })
});
const PROMIS_COMMON_REASONS = [
  { id: 1, zh: '我对性活动没有兴趣。', en: 'I am not interested in sexual activity.' },
  { id: 3, zh: '我难以达到性高潮。', en: 'I have difficulty having an orgasm.' },
  { id: 4, zh: '我不享受性活动。', en: 'I do not enjoy sexual activity.' },
  { id: 5, zh: '我有健康问题。', en: 'I have health problems.' },
  { id: 6, zh: '我没有伴侣。', en: 'I do not have a partner.' },
  { id: 7, zh: '我的伴侣不在身边。', en: 'My partner is away.' },
  { id: 8, zh: '我的伴侣没有兴趣。', en: 'My partner is not interested.' },
  { id: 9, zh: '我的伴侣有健康问题。', en: 'My partner has health problems.' },
  { id: 10, zh: '其他原因。', en: 'Other reason.' }
];
export const PROMIS_SEXFS_REASON_OPTIONS = Object.freeze({
  vaginal: freezeItems([
    PROMIS_COMMON_REASONS[0],
    { id: 2, zh: '我的阴道过于干燥，或我在性活动时有疼痛。', en: 'My vagina is too dry or I have pain during sexual activity.' },
    ...PROMIS_COMMON_REASONS.slice(1)
  ]),
  erectile: freezeItems([
    PROMIS_COMMON_REASONS[0],
    { id: 2, zh: '我难以勃起。', en: 'I have difficulty having an erection.' },
    ...PROMIS_COMMON_REASONS.slice(1)
  ])
});

const choice = (value, zh, en) => Object.freeze({ value, zh, en });
const PROMIS_CHOICES = Object.freeze({
  intensity: Object.freeze([choice(1, '完全没有', 'Not at all'), choice(2, '有一点', 'A little bit'), choice(3, '有一些', 'Somewhat'), choice(4, '相当多', 'Quite a bit'), choice(5, '非常', 'Very')]),
  frequency: Object.freeze([choice(1, '从不', 'Never'), choice(2, '很少', 'Rarely'), choice(3, '有时', 'Sometimes'), choice(4, '经常', 'Often'), choice(5, '总是', 'Always')]),
  almostAlways: Object.freeze([choice(1, '几乎从不／从不', 'Almost never / never'), choice(2, '很少', 'Rarely'), choice(3, '有时', 'Sometimes'), choice(4, '多数时候', 'Most times'), choice(5, '几乎总是／总是', 'Almost always / always')]),
  amount: Object.freeze([choice(1, '没有', 'None'), choice(2, '一点', 'A little bit'), choice(3, '一些', 'Somewhat'), choice(4, '相当多', 'Quite a bit'), choice(5, '很多', 'A lot')])
});

export const PROMIS_SEXFS_COMMON_ITEMS = freezeItems([
  { key: 'interestLevel', id: 'SFINT101', zh: '过去30天，你对性活动有多大兴趣？', en: 'How interested have you been in sexual activity?', choices: PROMIS_CHOICES.intensity },
  { key: 'interestFrequency', id: 'SFINT201', zh: '过去30天，你多常感到自己想进行性活动？', en: 'How often have you felt like you wanted to have sexual activity?', choices: PROMIS_CHOICES.frequency },
  { key: 'activity', id: 'SFSCR202', zh: '过去30天，你是否进行过任何类型的性活动？（包括自慰、口交和性交等）', en: 'Did you have any type of sexual activity?', choices: Object.freeze([choice(1, '否', 'No'), choice(2, '是', 'Yes')]) },
  { key: 'orgasmAbility', id: 'SFOGA201', zh: '当你想达到性高潮时，你多常能够达到？', en: 'When you wanted to have an orgasm, how often were you able to?', choices: Object.freeze([choice(0, '没有尝试', 'Did not try'), ...PROMIS_CHOICES.frequency]) },
  { key: 'orgasmPleasure', id: 'SFOGP203', zh: '你的性高潮有多令人满意？', en: 'How satisfying has your orgasm been?', choices: Object.freeze([choice(0, '没有达到性高潮', 'Did not have an orgasm'), ...PROMIS_CHOICES.intensity]) },
  { key: 'satisfaction', id: 'SFSAT101', zh: '你对自己的性生活有多满意？', en: 'How satisfied have you been with your sex life?', choices: PROMIS_CHOICES.intensity },
  { key: 'pleasure', id: 'SFSAT102r', zh: '你的性生活带给你多少愉悦？', en: 'How much pleasure has your sex life given you?', choices: PROMIS_CHOICES.amount }
]);

export const PROMIS_SEXFS_PROFILE_ITEMS = Object.freeze({
  vaginal: freezeItems([
    { key: 'lubricationFrequency', id: 'SFLUB001r', zh: '性活动时，你的阴道多常有润滑？', en: 'How often was your vagina lubricated during sexual activity?', choices: PROMIS_CHOICES.almostAlways },
    { key: 'lubricationMaintenance', id: 'SFLUB004r', zh: '维持阴道润滑对你来说有多困难？', en: 'How difficult has it been to maintain vaginal lubrication?', choices: Object.freeze([choice(1, '极其困难或不可能', 'Extremely difficult or impossible'), choice(2, '非常困难', 'Very difficult'), choice(3, '有些困难', 'Somewhat difficult'), choice(4, '有一点困难', 'A little difficult'), choice(5, '不困难', 'Not difficult')]) },
    { key: 'vaginalDiscomfort', id: 'SFVAG202', zh: '性活动时，你有多少阴道不适？', en: 'How much vaginal discomfort did you have during sexual activity?', choices: PROMIS_CHOICES.amount },
    { key: 'vaginalPain', id: 'SFVAG206', zh: '性活动时，你有多少阴道疼痛？', en: 'How much vaginal pain did you have during sexual activity?', choices: PROMIS_CHOICES.amount },
    { key: 'labialDiscomfort', id: 'SFVUL203', zh: '性活动时，你的阴唇有多少不适？', en: 'How much discomfort did you have in your labia during sexual activity?', choices: PROMIS_CHOICES.amount },
    { key: 'clitoralDiscomfort', id: 'SFVUC203', zh: '性活动时，你的阴蒂有多少不适？', en: 'How much discomfort did you have in your clitoris during sexual activity?', choices: PROMIS_CHOICES.amount }
  ]),
  erectile: freezeItems([
    { key: 'erectionFrequency', id: 'SFEFN005r', zh: '性活动时，你多常能够勃起？', en: 'How often were you able to have an erection during sexual activity?', choices: PROMIS_CHOICES.almostAlways },
    { key: 'erectionMaintenance', id: 'SFEFN008r', zh: '阴茎进入伴侣身体后，你多常能够维持勃起？', en: 'How often were you able to maintain your erection after penetration?', choices: Object.freeze([choice(0, '没有尝试性交', 'Did not attempt intercourse'), ...PROMIS_CHOICES.almostAlways]) }
  ])
});

export const RFS_VERSION = 'Relationship Flourishing Scale (RFS-12) · Fowers et al. (2016)';
export const RFS_ITEMS = freezeItems([
  { id: 1, zh: '因为伴侣的帮助，我更能实现自己的重要目标。', en: "I have more success in my important goals because of my partner's help.", response: 'agreement' },
  { id: 2, zh: '我们会寻找有助于我们作为伴侣共同成长的活动。', en: 'We look for activities that help us to grow as a couple.', response: 'agreement' },
  { id: 3, zh: '伴侣帮助我以一些靠自己无法做到的方式成长。', en: 'My partner has helped me to grow in ways that I could not have done on my own.', response: 'agreement' },
  { id: 4, zh: '与伴侣分享我最私人的想法是值得的。', en: 'It is worth it to share my most personal thoughts with my partner.', response: 'agreement' },
  { id: 5, zh: '做重要决定时，我会考虑这是否有利于我们的关系。', en: 'When making important decisions, I think about whether it will be good for our relationship.', response: 'frequency' },
  { id: 6, zh: '对我来说，做一些让关系保持稳固的事情自然且容易。', en: 'It is natural and easy for me to do things that keep our relationship strong.', response: 'frequency' },
  { id: 7, zh: '与伴侣交谈会帮助我以新的方式看待事情。', en: 'Talking with my partner helps me to see things in new ways.', response: 'frequency' },
  { id: 8, zh: '我会特意庆祝伴侣取得的成功。', en: "I make it a point to celebrate my partner's successes.", response: 'frequency' },
  { id: 9, zh: '我确实会努力改善我们的关系。', en: 'I really work to improve our relationship.', response: 'frequency' },
  { id: 10, zh: '伴侣会对我重视的事情表现出兴趣。', en: 'My partner shows interest in things that are important to me.', response: 'frequency' },
  { id: 11, zh: '我们会做一些对我们这对伴侣而言意义深远的事情。', en: 'We do things that are deeply meaningful to us as a couple.', response: 'frequency' },
  { id: 12, zh: '伴侣需要交谈时，我会为对方留出时间。', en: 'I make time when my partner needs to talk.', response: 'frequency' }
]);

export function blankScaleAnswers(length) {
  return Array(length).fill(null);
}

export function inspectScaleAnswers(answers, items, minimum, maximum) {
  if (!Array.isArray(answers) || answers.length !== items.length) {
    return Object.freeze({ complete: false, answered: 0, missing: items.map(item => item.id), invalid: ['shape'] });
  }
  const missing = [];
  const invalid = [];
  answers.forEach((answer, index) => {
    if (answer === null || answer === undefined || answer === '') missing.push(index + 1);
    else {
      const itemMin = items[index].min ?? minimum;
      const itemMax = items[index].max ?? maximum;
      if (!Number.isInteger(answer) || answer < itemMin || answer > itemMax) invalid.push(index + 1);
    }
  });
  return Object.freeze({ complete: !missing.length && !invalid.length, answered: items.length - missing.length, missing, invalid });
}

export function scoreCsi32(answers) {
  const inspection = inspectScaleAnswers(answers, CSI_32_ITEMS, 0, 5);
  if (!inspection.complete) return Object.freeze({ complete: false, inspection });
  const keyed = answers.map((answer, index) => CSI_32_ITEMS[index].reverse ? 5 - answer : answer);
  return Object.freeze({ complete: true, version: CSI_32_VERSION, total: keyed.reduce((sum, value) => sum + value, 0), range: Object.freeze([0, 161]) });
}

export function scoreGmsex(answers) {
  const inspection = inspectScaleAnswers(answers, GMSEX_ITEMS, 1, 7);
  if (!inspection.complete) return Object.freeze({ complete: false, inspection });
  return Object.freeze({ complete: true, version: GMSEX_VERSION, mean: round2(mean(answers)), total: answers.reduce((sum, value) => sum + value, 0), range: Object.freeze([1, 7]) });
}

export function scoreNsssS(answers) {
  const inspection = inspectScaleAnswers(answers, NSSS_S_ITEMS, 1, 5);
  if (!inspection.complete) return Object.freeze({ complete: false, inspection });
  return Object.freeze({
    complete: true,
    version: NSSS_S_VERSION,
    mean: round2(mean(answers)),
    total: answers.reduce((sum, value) => sum + value, 0),
    range: Object.freeze([12, 60])
  });
}

export function scoreKos(answers) {
  const inspection = inspectScaleAnswers(answers, KOS_ITEMS, 1, 5);
  if (!inspection.complete) return Object.freeze({ complete: false, inspection });
  const factors = Object.fromEntries(Object.keys(KOS_FACTOR_LABELS).map(factor => {
    const values = KOS_ITEMS.filter(item => item.factor === factor).map(item => answers[item.id - 1]);
    return [factor, Object.freeze({ total: values.reduce((sum, value) => sum + value, 0), mean: round2(mean(values)), items: values.length })];
  }));
  return Object.freeze({
    complete: true,
    version: KOS_VERSION,
    mean: round2(mean(answers)),
    total: answers.reduce((sum, value) => sum + value, 0),
    range: Object.freeze([18, 90]),
    factors: Object.freeze(factors)
  });
}

export function blankPromisSexFsResponse(profile = 'vaginal') {
  return { profile: PROMIS_SEXFS_PROFILES[profile] ? profile : 'vaginal', answers: {}, reasons: [] };
}

function validPromisChoice(item, value) {
  return item.choices.some(option => option.value === value);
}

export function inspectPromisSexFs(response) {
  const profile = response?.profile;
  if (!PROMIS_SEXFS_PROFILES[profile] || !response?.answers || typeof response.answers !== 'object' || Array.isArray(response.answers)) {
    return Object.freeze({ complete: false, answered: 0, required: 0, missing: Object.freeze(['shape']), invalid: Object.freeze(['shape']) });
  }
  const baseItems = PROMIS_SEXFS_COMMON_ITEMS.slice(0, 3);
  const active = response.answers.activity === 2;
  const inactive = response.answers.activity === 1;
  const branchItems = active ? [...PROMIS_SEXFS_COMMON_ITEMS.slice(3), ...PROMIS_SEXFS_PROFILE_ITEMS[profile]] : [];
  const requiredItems = [...baseItems, ...branchItems];
  const missing = [];
  const invalid = [];
  requiredItems.forEach(item => {
    const value = response.answers[item.key];
    if (value === null || value === undefined || value === '') missing.push(item.key);
    else if (!Number.isInteger(value) || !validPromisChoice(item, value)) invalid.push(item.key);
  });
  if (inactive) {
    if (!Array.isArray(response.reasons) || !response.reasons.length) missing.push('reasons');
    else if (response.reasons.some(value => !Number.isInteger(value) || value < 1 || value > PROMIS_SEXFS_REASON_OPTIONS[profile].length)) invalid.push('reasons');
  }
  if (!active && !inactive && response.answers.activity !== null && response.answers.activity !== undefined) invalid.push('activity');
  const required = requiredItems.length + (inactive ? 1 : 0);
  return Object.freeze({
    complete: !missing.length && !invalid.length,
    answered: required - missing.length,
    required,
    active,
    missing: Object.freeze(missing),
    invalid: Object.freeze(invalid)
  });
}

function rawDomain(label, values, direction) {
  if (values.some(value => value === 0)) return Object.freeze({ label, available: false, reason: '包含“不适用”回答', direction });
  return Object.freeze({ label, available: true, raw: values.reduce((sum, value) => sum + value, 0), range: Object.freeze([values.length, values.length * 5]), direction });
}

export function scorePromisSexFs(response) {
  const inspection = inspectPromisSexFs(response);
  if (!inspection.complete) return Object.freeze({ complete: false, inspection });
  const a = response.answers;
  const domains = {
    interest: rawDomain('性活动兴趣', [a.interestLevel, a.interestFrequency], 'higher-more')
  };
  if (inspection.active) {
    domains.orgasmAbility = rawDomain('达到性高潮的能力', [a.orgasmAbility], 'higher-better');
    domains.orgasmPleasure = rawDomain('性高潮愉悦', [a.orgasmPleasure], 'higher-better');
    domains.satisfaction = rawDomain('性生活满意度', [a.satisfaction, a.pleasure], 'higher-better');
    if (response.profile === 'vaginal') {
      domains.lubrication = rawDomain('润滑功能', [a.lubricationFrequency, a.lubricationMaintenance], 'higher-better');
      domains.vaginalDiscomfort = rawDomain('阴道不适', [a.vaginalDiscomfort, a.vaginalPain], 'higher-worse');
      domains.labialDiscomfort = rawDomain('阴唇不适', [a.labialDiscomfort], 'higher-worse');
      domains.clitoralDiscomfort = rawDomain('阴蒂不适', [a.clitoralDiscomfort], 'higher-worse');
    } else {
      domains.erectileFunction = rawDomain('勃起功能', [a.erectionFrequency, a.erectionMaintenance], 'higher-better');
    }
  }
  return Object.freeze({
    complete: true,
    version: PROMIS_SEXFS_VERSION,
    profile: response.profile,
    sexuallyActive: inspection.active,
    domains: Object.freeze(domains),
    scoringStatus: 'raw-domain-profile; official T-score conversion not applied locally'
  });
}

export function scoreRfs(answers) {
  const inspection = inspectScaleAnswers(answers, RFS_ITEMS, 1, 5);
  if (!inspection.complete) return Object.freeze({ complete: false, inspection });
  return Object.freeze({ complete: true, version: RFS_VERSION, mean: round2(mean(answers)), total: answers.reduce((sum, value) => sum + value, 0), range: Object.freeze([12, 60]) });
}
