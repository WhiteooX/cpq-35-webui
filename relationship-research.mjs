const clamp01 = value => Math.min(1, Math.max(0, value));
const round1 = value => Math.round(value * 10) / 10;
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;

export function computeCommunicationStrain(dyad) {
  if (!dyad?.complete || !dyad.A?.scores || !dyad.B?.scores) {
    return Object.freeze({ available: false, reason: 'Both complete CPQ-35 reports are required' });
  }

  const constructiveMean = mean([
    dyad.A.scores.constructiveCommunication,
    dyad.B.scores.constructiveCommunication
  ]);
  const demandWithdrawMean = mean([
    dyad.A.scores.selfDemandPartnerWithdraw,
    dyad.A.scores.partnerDemandSelfWithdraw,
    dyad.B.scores.selfDemandPartnerWithdraw,
    dyad.B.scores.partnerDemandSelfWithdraw
  ]);

  const lowConstructive = clamp01(1 - ((constructiveMean - 9) / (81 - 9)));
  const demandWithdraw = clamp01((demandWithdrawMean - 7) / (63 - 7));
  const value = mean([lowConstructive, demandWithdraw]);

  return Object.freeze({
    available: true,
    value: round1(value * 100),
    components: Object.freeze({
      lowConstructiveCommunication: round1(lowConstructive * 100),
      demandWithdraw: round1(demandWithdraw * 100)
    }),
    formula: '50% × low constructive communication + 50% × demand/withdraw',
    interpretation: 'Concurrent communication-strain research index; not a divorce probability or validated clinical scale'
  });
}
function sigmoid(value) {
  if (value >= 0) {
    const exp = Math.exp(-value);
    return 1 / (1 + exp);
  }
  const exp = Math.exp(value);
  return exp / (1 + exp);
}

function logit(probability) {
  const bounded = Math.min(1 - 1e-12, Math.max(1e-12, probability));
  return Math.log(bounded / (1 - bounded));
}

function unavailable(code, reason) {
  return Object.freeze({ available: false, code, reason });
}

export function evaluateDivorceProbability(features, config) {
  if (!config) return unavailable('NO_MODEL', 'No calibrated longitudinal model is configured');
  if (config.deploymentApproved !== true) {
    return unavailable('NOT_APPROVED', 'The configured model has not been approved for deployment');
  }
  if (config.outcome !== 'legal_divorce' || !Number.isInteger(config.horizonMonths) || config.horizonMonths <= 0) {
    return unavailable('INVALID_TARGET', 'Model outcome and time horizon are invalid');
  }
  if (config.externalValidation?.status !== 'passed') {
    return unavailable('NO_EXTERNAL_VALIDATION', 'Independent external validation has not passed');
  }
  if (!Number.isFinite(config.intercept) || !config.coefficients || !config.standardization) {
    return unavailable('INVALID_MODEL', 'Model coefficients or standardization are invalid');
  }

  let linearPredictor = config.intercept;
  for (const [feature, coefficient] of Object.entries(config.coefficients)) {
    const value = features?.[feature];
    const standardization = config.standardization[feature];
    if (!Number.isFinite(value)) return unavailable('MISSING_FEATURE', `Missing feature: ${feature}`);
    if (!Number.isFinite(coefficient) || !Number.isFinite(standardization?.mean) || !Number.isFinite(standardization?.scale) || standardization.scale <= 0) {
      return unavailable('INVALID_MODEL', `Invalid coefficient metadata: ${feature}`);
    }
    linearPredictor += coefficient * ((value - standardization.mean) / standardization.scale);
  }

  const rawProbability = sigmoid(linearPredictor);
  const calibration = config.calibration || { intercept: 0, slope: 1 };
  if (!Number.isFinite(calibration.intercept) || !Number.isFinite(calibration.slope) || calibration.slope <= 0) {
    return unavailable('INVALID_CALIBRATION', 'Calibration parameters are invalid');
  }
  const probability = sigmoid(calibration.intercept + calibration.slope * logit(rawProbability));

  return Object.freeze({
    available: true,
    probability,
    percentage: round1(probability * 100),
    horizonMonths: config.horizonMonths,
    outcome: config.outcome,
    modelId: config.modelId,
    population: config.population,
    externalValidation: config.externalValidation
  });
}
