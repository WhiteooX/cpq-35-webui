# Fixed-horizon legal-divorce probability research pipeline

This folder supplies a development pipeline, not a ready-made probability model. The WebUI refuses to display a percentage until an independently reviewed configuration has both:

- `externalValidation.status: "passed"`
- `deploymentApproved: true`

## Outcome definition

Choose one fixed horizon before data collection, for example legal divorce within 60 months of baseline. Do not mix legal divorce, separation, unmarried breakup, thoughts of leaving, and satisfaction decline into one outcome.

The provided script fits fixed-horizon logistic regression. Rows without complete horizon follow-up must not be coded as non-events. If censoring or unequal follow-up is material, use a prespecified survival-analysis pipeline instead.

## Minimum CSV

```csv
coupleId,legalDivorceWithinHorizon,cpqCommunicationStrain
study-0001,0,34.2
study-0002,1,78.5
```

Use pseudonymous couple IDs. The development and external-validation files must contain different couples; preferably they should come from different sites or recruitment periods.

Additional numeric features can be supplied with `--features`, but every feature must be defined before modeling, use the same scoring at deployment, and be present in the WebUI before a probability can be calculated.

## Train and calibrate

```bash
python3 research/train_divorce_model.py research/development.csv \
  --external-dataset research/external.csv \
  --horizon-months 60 \
  --population "Country, married couples, recruitment setting and baseline marriage duration" \
  --output divorce-model-candidate.js
```

The script uses a couple-level deterministic 70/15/15 development split, fits L2 logistic regression, calibrates on the calibration split, and reports test-set Brier score, log loss, AUC, calibration intercept and calibration slope. An external dataset is evaluated separately.

The hard floor of 300 couples and 30 events is only a software guard, not evidence that the sample is adequate. Sample-size planning, missing-data handling, prespecification, subgroup performance, temporal/geographic validation, and an independent statistical review remain required.

## Deployment gate

After independent external validation and review:

1. document the cohort, sample size, event count, Brier score and calibration slope;
2. set `externalValidation.status` to `passed` only if the preregistered criteria were met;
3. set `deploymentApproved` to `true` through the project governance process;
4. copy the reviewed configuration to `divorce-model-config.js`;
5. rerun browser tests and audit the population/horizon wording shown to users.

Never insert guessed coefficients or a population divorce rate into the configuration.
