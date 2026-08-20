import assert from 'node:assert/strict';
import { CPQ_ITEMS, inspectAnswers, scoreDyad, scoreRespondent } from './cpq-model.mjs';

assert.equal(CPQ_ITEMS.length, 35);
assert.deepEqual(
  Object.fromEntries(['emergence', 'discussion', 'after'].map(stage => [stage, CPQ_ITEMS.filter(item => item.stage === stage).length])),
  { emergence: 4, discussion: 18, after: 13 }
);

const incomplete = Array(35).fill(null);
incomplete[0] = 5;
assert.equal(scoreRespondent(incomplete).scores, null);
assert.equal(inspectAnswers(incomplete).answered, 1);

const invalid = Array(35).fill(5);
invalid[7] = 10;
assert.deepEqual(inspectAnswers(invalid).invalid, [8]);

const allOnes = scoreRespondent(Array(35).fill(1));
assert.deepEqual(allOnes.scores, {
  constructiveCommunication: 33,
  selfDemandPartnerWithdraw: 7,
  partnerDemandSelfWithdraw: 7
});

const constructiveMaximum = Array(35).fill(5);
[2, 6, 8, 23, 25, 27].forEach(item => { constructiveMaximum[item - 1] = 9; });
[1, 24, 26].forEach(item => { constructiveMaximum[item - 1] = 1; });
assert.equal(scoreRespondent(constructiveMaximum).scores.constructiveCommunication, 81);

const A = Array(35).fill(1);
const B = Array(35).fill(1);
[3, 9, 11, 13, 17, 19, 32].forEach(item => { A[item - 1] = 9; });
[4, 10, 12, 14, 18, 20, 33].forEach(item => { B[item - 1] = 8; });
const dyad = scoreDyad(A, B);
assert.equal(dyad.complete, true);
assert.deepEqual(dyad.comparisons.aDemandBWithdraw, { reportA: 63, reportB: 56, gap: 7 });

console.log('CPQ model tests passed.');
