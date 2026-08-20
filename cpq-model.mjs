export const CPQ_VERSION = 'CPQ-35 / revised scoring (Crenshaw et al., 2017)';

export const CPQ_STAGES = Object.freeze({
  emergence: Object.freeze({ zh: '问题出现时', en: 'When a problem arises', count: 4 }),
  discussion: Object.freeze({ zh: '讨论问题时', en: 'During a discussion', count: 18 }),
  after: Object.freeze({ zh: '讨论结束后', en: 'After a discussion', count: 13 })
});

// The English wording follows the self/partner form used with revised scoring.
// Chinese is displayed as a parallel reading aid; the English wording remains visible.
export const CPQ_ITEMS = Object.freeze([
  { id: 1, stage: 'emergence', en: 'Both my partner and I avoid discussing the problem.', zh: '我和伴侣双方都回避讨论这个问题。' },
  { id: 2, stage: 'emergence', en: 'Both my partner and I try to discuss the problem.', zh: '我和伴侣双方都尝试讨论这个问题。' },
  { id: 3, stage: 'emergence', en: 'I try to start a discussion while my partner tries to avoid a discussion.', zh: '我试图开始讨论，而伴侣试图回避讨论。' },
  { id: 4, stage: 'emergence', en: 'My partner tries to start a discussion while I try to avoid a discussion.', zh: '伴侣试图开始讨论，而我试图回避讨论。' },

  { id: 5, stage: 'discussion', en: 'Both my partner and I blame, accuse, and criticize one another.', zh: '我和伴侣双方互相责备、指责和批评。' },
  { id: 6, stage: 'discussion', en: 'Both my partner and I express our feelings to each other.', zh: '我和伴侣双方都向对方表达自己的感受。' },
  { id: 7, stage: 'discussion', en: 'Both my partner and I threaten one another with negative consequences.', zh: '我和伴侣双方都以负面后果威胁对方。' },
  { id: 8, stage: 'discussion', en: 'Both my partner and I suggest possible solutions and compromises.', zh: '我和伴侣双方都提出可能的解决办法和妥协方案。' },
  { id: 9, stage: 'discussion', en: 'I nag and demand while my partner withdraws, becomes silent, or refuses to discuss the matter further.', zh: '我反复催促和要求，而伴侣退缩、沉默或拒绝继续讨论。' },
  { id: 10, stage: 'discussion', en: 'My partner nags and demands while I withdraw, become silent, or refuse to discuss the matter further.', zh: '伴侣反复催促和要求，而我退缩、沉默或拒绝继续讨论。' },
  { id: 11, stage: 'discussion', en: 'I criticize while my partner defends themself.', zh: '我批评伴侣，而伴侣为自己辩护。' },
  { id: 12, stage: 'discussion', en: 'My partner criticizes while I defend myself.', zh: '伴侣批评我，而我为自己辩护。' },
  { id: 13, stage: 'discussion', en: 'I pressure my partner to take some action or stop some action, while my partner resists.', zh: '我向伴侣施压，要求其采取或停止某种行动，而伴侣抵制。' },
  { id: 14, stage: 'discussion', en: 'My partner pressures me to take some action or stop some action, while I resist.', zh: '伴侣向我施压，要求我采取或停止某种行动，而我抵制。' },
  { id: 15, stage: 'discussion', en: 'I express feelings while my partner offers reasons and solutions.', zh: '我表达感受，而伴侣给出理由和解决办法。' },
  { id: 16, stage: 'discussion', en: 'My partner expresses feelings while I offer reasons and solutions.', zh: '伴侣表达感受，而我给出理由和解决办法。' },
  { id: 17, stage: 'discussion', en: 'I threaten negative consequences and my partner gives in or backs down.', zh: '我以负面后果相威胁，而伴侣让步或退让。' },
  { id: 18, stage: 'discussion', en: 'My partner threatens negative consequences and I give in or back down.', zh: '伴侣以负面后果相威胁，而我让步或退让。' },
  { id: 19, stage: 'discussion', en: 'I call my partner names, swear at them, or attack their character.', zh: '我辱骂伴侣、对其说脏话或攻击其人格。' },
  { id: 20, stage: 'discussion', en: 'My partner calls me names, swears at me, or attacks my character.', zh: '伴侣辱骂我、对我说脏话或攻击我的人格。' },
  { id: 21, stage: 'discussion', en: 'I push, shove, slap, hit, or kick my partner.', zh: '我推搡、掌掴、击打或踢伴侣。' },
  { id: 22, stage: 'discussion', en: 'My partner pushes, shoves, slaps, hits, or kicks me.', zh: '伴侣推搡、掌掴、击打或踢我。' },

  { id: 23, stage: 'after', en: 'Both my partner and I feel understood by each other.', zh: '我和伴侣双方都感到被对方理解。' },
  { id: 24, stage: 'after', en: 'Both my partner and I withdraw from each other after the discussion.', zh: '讨论后，我和伴侣双方都疏远对方。' },
  { id: 25, stage: 'after', en: 'Both my partner and I feel that the problem has been solved.', zh: '我和伴侣双方都觉得问题已经解决。' },
  { id: 26, stage: 'after', en: 'Neither my partner nor I give in to the other after the discussion.', zh: '讨论后，我和伴侣谁都不向对方让步。' },
  { id: 27, stage: 'after', en: 'After the discussion, both my partner and I try to be especially nice to each other.', zh: '讨论后，我和伴侣双方都努力对彼此格外友善。' },
  { id: 28, stage: 'after', en: 'I feel guilty for what I said or did while my partner feels hurt.', zh: '我为自己的言行感到内疚，而伴侣感到受伤。' },
  { id: 29, stage: 'after', en: 'My partner feels guilty for what they said or did while I feel hurt.', zh: '伴侣为其言行感到内疚，而我感到受伤。' },
  { id: 30, stage: 'after', en: 'I try to be especially nice and act as if things are back to normal, while my partner acts distant.', zh: '我努力表现得格外友善，仿佛一切恢复正常，而伴侣表现得疏远。' },
  { id: 31, stage: 'after', en: 'My partner tries to be especially nice and acts as if things are back to normal, while I act distant.', zh: '伴侣努力表现得格外友善，仿佛一切恢复正常，而我表现得疏远。' },
  { id: 32, stage: 'after', en: 'I pressure my partner to apologize or promise to do better, while my partner resists.', zh: '我向伴侣施压，要求其道歉或承诺改进，而伴侣抵制。' },
  { id: 33, stage: 'after', en: 'My partner pressures me to apologize or promise to do better, while I resist.', zh: '伴侣向我施压，要求我道歉或承诺改进，而我抵制。' },
  { id: 34, stage: 'after', en: 'I seek support from others, such as a parent, friend, or child.', zh: '我向其他人寻求支持，例如父母、朋友或孩子。' },
  { id: 35, stage: 'after', en: 'My partner seeks support from others, such as a parent, friend, or child.', zh: '伴侣向其他人寻求支持，例如父母、朋友或孩子。' }
]);

export const CPQ_SCORING = Object.freeze({
  constructiveCommunication: Object.freeze({
    labelZh: '建设性沟通',
    labelEn: 'Constructive Communication',
    direct: Object.freeze([2, 6, 8, 23, 25, 27]),
    reverse: Object.freeze([1, 24, 26]),
    min: 9,
    max: 81
  }),
  selfDemandPartnerWithdraw: Object.freeze({
    labelZh: '自己要求／伴侣回避',
    labelEn: 'Self-demand / Partner-withdraw',
    direct: Object.freeze([3, 9, 11, 13, 17, 19, 32]),
    reverse: Object.freeze([]),
    min: 7,
    max: 63
  }),
  partnerDemandSelfWithdraw: Object.freeze({
    labelZh: '伴侣要求／自己回避',
    labelEn: 'Partner-demand / Self-withdraw',
    direct: Object.freeze([4, 10, 12, 14, 18, 20, 33]),
    reverse: Object.freeze([]),
    min: 7,
    max: 63
  })
});

export function isValidAnswer(value) {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

export function inspectAnswers(answers) {
  const safe = Array.isArray(answers) ? answers : [];
  const missing = [];
  const invalid = [];
  for (let index = 0; index < 35; index += 1) {
    const value = safe[index];
    if (value === null || value === undefined) missing.push(index + 1);
    else if (!isValidAnswer(value)) invalid.push(index + 1);
  }
  if (safe.length !== 35) {
    for (let index = 35; index < safe.length; index += 1) invalid.push(index + 1);
  }
  return Object.freeze({
    answered: 35 - missing.length,
    complete: missing.length === 0 && invalid.length === 0 && safe.length === 35,
    missing: Object.freeze(missing),
    invalid: Object.freeze(invalid)
  });
}

function sumScale(answers, definition) {
  const direct = definition.direct.reduce((total, item) => total + answers[item - 1], 0);
  const reversed = definition.reverse.reduce((total, item) => total + (10 - answers[item - 1]), 0);
  return direct + reversed;
}

export function scoreRespondent(answers) {
  const inspection = inspectAnswers(answers);
  if (!inspection.complete) return Object.freeze({ ...inspection, scores: null });
  const scores = {};
  for (const [key, definition] of Object.entries(CPQ_SCORING)) {
    scores[key] = sumScale(answers, definition);
  }
  return Object.freeze({ ...inspection, scores: Object.freeze(scores) });
}

export function scoreDyad(answersA, answersB) {
  const A = scoreRespondent(answersA);
  const B = scoreRespondent(answersB);
  if (!A.complete || !B.complete) return Object.freeze({ complete: false, A, B, comparisons: null });

  const comparisons = Object.freeze({
    constructiveCommunication: Object.freeze({
      reportA: A.scores.constructiveCommunication,
      reportB: B.scores.constructiveCommunication,
      gap: Math.abs(A.scores.constructiveCommunication - B.scores.constructiveCommunication)
    }),
    aDemandBWithdraw: Object.freeze({
      reportA: A.scores.selfDemandPartnerWithdraw,
      reportB: B.scores.partnerDemandSelfWithdraw,
      gap: Math.abs(A.scores.selfDemandPartnerWithdraw - B.scores.partnerDemandSelfWithdraw)
    }),
    bDemandAWithdraw: Object.freeze({
      reportA: A.scores.partnerDemandSelfWithdraw,
      reportB: B.scores.selfDemandPartnerWithdraw,
      gap: Math.abs(A.scores.partnerDemandSelfWithdraw - B.scores.selfDemandPartnerWithdraw)
    })
  });

  return Object.freeze({ complete: true, A, B, comparisons });
}
