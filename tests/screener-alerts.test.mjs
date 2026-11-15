import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advance, evaluateSnapshot} from '../screener-alerts.mjs';
const sample = overrides => ({securityId:'NASDAQ:AAPL',ruleVersion:'v1',sessionDate:'2026-11-12',interval:'1day',closed:true,dataValid:true,marketCapUSD:1e9,close:50,ma20:49,ma150:60,volume5:120,volumePrior20:100,atr14:2,pattern:{status:'confirmed',name:'double-bottom'},...overrides});
test('baseline, entry, repeated scan and continuation',()=>{
 let state=advance(null,sample({close:48})).state;
 const next=sample({sessionDate:'2026-11-13'});
 const entered=advance(state,next); assert.ok(entered.alert); assert.equal(entered.alert.atrPercent,4);
 state=entered.state;
 for(let i=0;i<10;i++) assert.equal(advance(state,next).alert,null);
 assert.equal(advance(state,sample({sessionDate:'2026-11-16'})).alert,null);
 assert.equal(advance(null,next).alert,null);
});
test('boundaries, MA150 informational, missing data',()=>{
 assert.equal(evaluateSnapshot(sample()),'pass');
 for(const o of [{marketCapUSD:999999999},{close:5},{ma20:50},{volume5:100},{pattern:{status:'absent'}}]) assert.equal(evaluateSnapshot(sample(o)),'fail');
 for(const o of [{marketCapUSD:null},{volume5:null},{closed:false},{interval:'1h'},{pattern:null},{dataValid:false}]) assert.equal(evaluateSnapshot(sample(o)),'unknown');
 assert.equal(evaluateSnapshot(sample({ma150:null,atr14:null})),'pass');
});
test('unknown preserves state; reentry; new rules; stale snapshots',()=>{
 const old=advance(null,sample()).state;
 assert.deepEqual(advance(old,sample({sessionDate:'2026-11-13',volume5:null})),{state:old,alert:null});
 assert.equal(advance(old,sample({sessionDate:'2026-11-16'})).alert,null);
 const fail=advance(old,sample({sessionDate:'2026-11-13',close:48})).state;
 assert.ok(advance(fail,sample({sessionDate:'2026-11-16'})).alert);
 assert.equal(advance(fail,sample({sessionDate:'2026-11-16',ruleVersion:'v2'})).alert,null);
 assert.deepEqual(advance(fail,sample()),{state:fail,alert:null});
});
test('invalid calendar dates and immutable evidence',()=>{
 assert.throws(()=>advance(null,sample({sessionDate:'2026-02-30'})));
 const s=sample({sessionDate:'2026-11-13'});
 const r=advance(advance(null,sample({close:48})).state,s);
 s.pattern.name='changed'; assert.equal(r.alert.pattern.name,'double-bottom');
});
