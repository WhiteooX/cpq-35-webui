window.CPQ_DIVORCE_MODEL = {
  modelId: 'replace-with-reviewed-model-id',
  outcome: 'legal_divorce',
  horizonMonths: 60,
  population: 'describe the population, country, marriage duration, and recruitment setting',
  intercept: 'replace-with-fitted-number',
  coefficients: {
    cpqCommunicationStrain: 'replace-with-fitted-number'
  },
  standardization: {
    cpqCommunicationStrain: { mean: 'replace-with-training-mean', scale: 'replace-with-training-standard-deviation' }
  },
  calibration: { intercept: 'replace-with-calibration-intercept', slope: 'replace-with-calibration-slope' },
  externalValidation: {
    status: 'not_performed',
    sampleSize: 0,
    events: 0,
    brier: null,
    calibrationSlope: null,
    cohort: null
  },
  deploymentApproved: false
};
