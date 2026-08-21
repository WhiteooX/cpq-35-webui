export const LONGITUDINAL_SCHEMA = 'cpq-couple-longitudinal/1.0';
const COUPLE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/;

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function metric(record, path) {
  let value = record;
  for (const key of path) value = value?.[key];
  return finiteOrNull(value);
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateLongitudinalRecord(record) {
  const errors = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) errors.push('record');
  if (record?.schema !== LONGITUDINAL_SCHEMA) errors.push('schema');
  if (!COUPLE_ID_PATTERN.test(record?.assessment?.coupleId || '')) errors.push('coupleId');
  if (!isIsoDate(record?.assessment?.date)) errors.push('date');
  if (typeof record?.assessment?.timepoint !== 'string' || !record.assessment.timepoint.trim() || record.assessment.timepoint.length > 80) errors.push('timepoint');
  if (!record?.measures || typeof record.measures !== 'object') errors.push('measures');
  return Object.freeze({ valid: !errors.length, errors: Object.freeze(errors) });
}

export function recordMetrics(record) {
  return Object.freeze({
    cpqConstructiveA: metric(record, ['measures', 'cpq', 'scores', 'A', 'constructiveCommunication']),
    cpqConstructiveB: metric(record, ['measures', 'cpq', 'scores', 'B', 'constructiveCommunication']),
    cpqDemandWithdrawA: metric(record, ['measures', 'cpq', 'scores', 'A', 'demandWithdrawMean']),
    cpqDemandWithdrawB: metric(record, ['measures', 'cpq', 'scores', 'B', 'demandWithdrawMean']),
    communicationStrain: metric(record, ['measures', 'cpq', 'communicationStrain', 'value']),
    ecrAnxietyA: metric(record, ['measures', 'ecrR', 'scores', 'A', 'anxiety']),
    ecrAnxietyB: metric(record, ['measures', 'ecrR', 'scores', 'B', 'anxiety']),
    ecrAvoidanceA: metric(record, ['measures', 'ecrR', 'scores', 'A', 'avoidance']),
    ecrAvoidanceB: metric(record, ['measures', 'ecrR', 'scores', 'B', 'avoidance']),
    dciTotalA: metric(record, ['measures', 'dci', 'scores', 'A', 'totalWithoutEvaluation']),
    dciTotalB: metric(record, ['measures', 'dci', 'scores', 'B', 'totalWithoutEvaluation']),
    csiTotalA: metric(record, ['measures', 'csi32', 'scores', 'A', 'total']),
    csiTotalB: metric(record, ['measures', 'csi32', 'scores', 'B', 'total']),
    gmsexMeanA: metric(record, ['measures', 'gmsex', 'scores', 'A', 'mean']),
    gmsexMeanB: metric(record, ['measures', 'gmsex', 'scores', 'B', 'mean']),
    nsssTotalA: metric(record, ['measures', 'nsssS', 'scores', 'A', 'total']),
    nsssTotalB: metric(record, ['measures', 'nsssS', 'scores', 'B', 'total']),
    kosTotalA: metric(record, ['measures', 'kos18', 'scores', 'A', 'total']),
    kosTotalB: metric(record, ['measures', 'kos18', 'scores', 'B', 'total']),
    promisSatisfactionRawA: metric(record, ['measures', 'promisSexFs2', 'scores', 'A', 'domains', 'satisfaction', 'raw']),
    promisSatisfactionRawB: metric(record, ['measures', 'promisSexFs2', 'scores', 'B', 'domains', 'satisfaction', 'raw']),
    rfsTotalA: metric(record, ['measures', 'rfs12', 'scores', 'A', 'total']),
    rfsTotalB: metric(record, ['measures', 'rfs12', 'scores', 'B', 'total'])
  });
}

export function buildLongitudinalDataset(records) {
  const accepted = [];
  const rejected = [];
  const seen = new Set();
  records.forEach((record, index) => {
    const validation = validateLongitudinalRecord(record);
    if (!validation.valid) {
      rejected.push({ index, errors: validation.errors });
      return;
    }
    const key = `${record.assessment.coupleId}|${record.assessment.date}|${record.assessment.timepoint}`;
    if (seen.has(key)) {
      rejected.push({ index, errors: ['duplicate'] });
      return;
    }
    seen.add(key);
    accepted.push(Object.freeze({
      coupleId: record.assessment.coupleId,
      date: record.assessment.date,
      timepoint: record.assessment.timepoint.trim(),
      metrics: recordMetrics(record),
      source: record
    }));
  });
  accepted.sort((a, b) => a.coupleId.localeCompare(b.coupleId) || a.date.localeCompare(b.date) || a.timepoint.localeCompare(b.timepoint));
  return Object.freeze({ accepted: Object.freeze(accepted), rejected: Object.freeze(rejected) });
}

export function summarizeChange(points, metricKey) {
  const available = points.filter(point => Number.isFinite(point.metrics[metricKey]));
  if (available.length < 2) return Object.freeze({ available: false, count: available.length });
  const first = available[0];
  const last = available[available.length - 1];
  return Object.freeze({
    available: true,
    count: available.length,
    first: first.metrics[metricKey],
    last: last.metrics[metricKey],
    change: Math.round((last.metrics[metricKey] - first.metrics[metricKey]) * 100) / 100,
    from: first.date,
    to: last.date
  });
}
