// Input is a trusted scanner snapshot, never a model's free-form answer.
// Call inside one durable transaction per security + ruleVersion.
export function evaluateSnapshot(s) {
  const positive = x => Number.isFinite(x) && x > 0;
  if (s.interval !== '1day' || s.closed !== true || s.dataValid !== true) return 'unknown';
  if (!positive(s.marketCapUSD) || !positive(s.close) || !positive(s.ma20) ||
      !Number.isFinite(s.volume5) || s.volume5 < 0 || !positive(s.volumePrior20) ||
      !['confirmed', 'absent'].includes(s.pattern?.status)) return 'unknown';
  return s.marketCapUSD >= 1e9 && s.close > 5 && s.close > s.ma20 &&
    s.volume5 > s.volumePrior20 && s.pattern.status === 'confirmed' ? 'pass' : 'fail';
}
export function advance(previous, snapshot) {
  const s = structuredClone(snapshot);
  if (!s.securityId || !s.ruleVersion || !/^\d{4}-\d{2}-\d{2}$/.test(s.sessionDate || '') ||
      !Number.isFinite(Date.parse(s.sessionDate)) || new Date(s.sessionDate).toISOString().slice(0,10) !== s.sessionDate) {
    throw new TypeError('securityId, ruleVersion and valid sessionDate required');
  }
  const same = previous?.securityId === s.securityId && previous?.ruleVersion === s.ruleVersion;
  if (same && s.sessionDate <= previous.sessionDate) return {state: previous, alert: null};
  const status = evaluateSnapshot(s);
  // Missing/incomplete data neither establishes a baseline nor resets a pass.
  if (status === 'unknown') return {state: previous ?? null, alert: null};
  const state = {securityId:s.securityId, ruleVersion:s.ruleVersion, sessionDate:s.sessionDate, status};
  const entered = same && previous.status === 'fail' && status === 'pass';
  return {state, alert: entered ? {
    id: JSON.stringify([s.securityId, s.ruleVersion, s.sessionDate]),
    securityId:s.securityId, ruleVersion:s.ruleVersion, sessionDate:s.sessionDate,
    close:s.close, ma20:s.ma20, ma150:Number.isFinite(s.ma150)?s.ma150:null,
    volume5:s.volume5, volumePrior20:s.volumePrior20,
    atr14:Number.isFinite(s.atr14)&&s.atr14>=0?s.atr14:null,
    atrPercent:Number.isFinite(s.atr14)&&s.atr14>=0?s.atr14/s.close*100:null,
    pattern:s.pattern, source:s.source ?? null
  } : null};
}
