#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'lifecycle.html');

function extractInlineScript(html) {
  const match = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/i);
  if (!match) throw new Error('lifecycle.html에서 마지막 inline script를 찾지 못했습니다.');
  return match[1];
}

function createSandbox() {
  const noop = () => {};
  const fakeElement = () => ({
    value: '', innerHTML: '', innerText: '', textContent: '', style: {}, options: [],
    checked: false, disabled: false, className: '', dataset: {},
    appendChild: noop, removeChild: noop, addEventListener: noop,
    querySelector: () => fakeElement(), querySelectorAll: () => [],
    setAttribute: noop, removeAttribute: noop,
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    focus: noop, select: noop
  });
  const elements = new Map();
  const getElement = (id) => { if (!elements.has(id)) elements.set(id, fakeElement()); return elements.get(id); };

  const sandbox = {
    console, setTimeout, clearTimeout, Blob,
    URL: { createObjectURL: () => 'blob:mock', revokeObjectURL: noop },
    navigator: { clipboard: { writeText: async () => {} } },
    alert: noop, confirm: () => true,
    localStorage: {
      _store: new Map(),
      getItem(key) { return this._store.has(key) ? this._store.get(key) : null; },
      setItem(key, value) { this._store.set(key, String(value)); },
      removeItem(key) { this._store.delete(key); }
    },
    document: {
      addEventListener: noop, querySelector: () => fakeElement(), querySelectorAll: () => [],
      createElement: () => fakeElement(), getElementById: getElement, body: fakeElement(),
      documentElement: { style: { setProperty: noop } }, activeElement: null, execCommand: () => true
    },
    window: { location: { hash: '' }, requestAnimationFrame: (cb) => cb() }
  };
  sandbox.globalThis = sandbox;
  return sandbox;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const scriptBody = extractInlineScript(html);
  new Function(scriptBody);

  const sandbox = createSandbox();
  const instrumented = `${scriptBody}
globalThis.__alignHooks = { evaluateAdvancedAlignment, STUDY_TYPES };`;
  vm.createContext(sandbox);
  vm.runInContext(instrumented, sandbox, { filename: 'lifecycle-inline.js' });

  const { evaluateAdvancedAlignment } = sandbox.__alignHooks;
  assert(evaluateAdvancedAlignment, 'evaluateAdvancedAlignment 노출 실패');

  const emptyLit = { columns: { gap: [] }, gapSummary: '' };
  const filledLit = { columns: { gap: [{ id: '1', title: 'X' }] }, gapSummary: '' };
  const filledSummaryLit = { columns: { gap: [] }, gapSummary: '아직 답이 없는 부분' };

  // A-01: 단위 불일치 트리거/비트리거
  let w = evaluateAdvancedAlignment({ primaryOutcome: '종양 크기 변화율(%)', successCriteria: '12개월 이상 생존' }, emptyLit);
  assert(w.some(x => x.id === 'A-01'), 'A-01이 단위 불일치(% vs 개월)에서 감지되어야 합니다.');
  w = evaluateAdvancedAlignment({ primaryOutcome: '종양 크기 변화율(%)', successCriteria: '대조군 대비 20% 이상 감소' }, emptyLit);
  assert(!w.some(x => x.id === 'A-01'), 'A-01은 단위가 일치하면 감지되지 않아야 합니다.');

  // A-02: 유형 핵심질문 키워드 불일치/일치
  w = evaluateAdvancedAlignment({ studyType: 'clinical', researchQuestion: '재료의 강도를 측정한다' }, emptyLit);
  assert(w.some(x => x.id === 'A-02'), 'A-02는 임상 키워드(안전성/유효성)가 없을 때 감지되어야 합니다.');
  w = evaluateAdvancedAlignment({ studyType: 'clinical', researchQuestion: '신약의 안전성을 평가한다' }, emptyLit);
  assert(!w.some(x => x.id === 'A-02'), 'A-02는 핵심 키워드가 있으면 감지되지 않아야 합니다.');

  // A-03: 임상/비임상 + 리스크 미기입/기입
  w = evaluateAdvancedAlignment({ studyType: 'nonclinical', mainRisk: '' }, emptyLit);
  assert(w.some(x => x.id === 'A-03'), 'A-03은 비임상+리스크 미기입에서 감지되어야 합니다.');
  w = evaluateAdvancedAlignment({ studyType: 'nonclinical', mainRisk: '모델 외삽 실패' }, emptyLit);
  assert(!w.some(x => x.id === 'A-03'), 'A-03은 리스크가 기입되면 감지되지 않아야 합니다.');
  w = evaluateAdvancedAlignment({ studyType: 'basic', mainRisk: '' }, emptyLit);
  assert(!w.some(x => x.id === 'A-03'), 'A-03은 basic 유형에서는 감지되지 않아야 합니다.');

  // A-04: 비임상 + Go/No-Go 미기입/기입
  w = evaluateAdvancedAlignment({ studyType: 'nonclinical', goNoGo: '' }, emptyLit);
  assert(w.some(x => x.id === 'A-04'), 'A-04는 비임상+Go/No-Go 미기입에서 감지되어야 합니다.');
  w = evaluateAdvancedAlignment({ studyType: 'nonclinical', goNoGo: '효능 20% 이상' }, emptyLit);
  assert(!w.some(x => x.id === 'A-04'), 'A-04는 Go/No-Go가 기입되면 감지되지 않아야 합니다.');

  // A-05: 1차/2차 결과변수 중복/비중복
  w = evaluateAdvancedAlignment({ primaryOutcome: '종양 크기 변화율(%)', secondaryOutcomes: '종양 크기 변화율(%), 체중 변화' }, emptyLit);
  assert(w.some(x => x.id === 'A-05'), 'A-05는 1차/2차 결과변수가 같을 때 감지되어야 합니다.');
  w = evaluateAdvancedAlignment({ primaryOutcome: '종양 크기 변화율(%)', secondaryOutcomes: '체중 변화, 생존 기간' }, emptyLit);
  assert(!w.some(x => x.id === 'A-05'), 'A-05는 1차/2차 결과변수가 다르면 감지되지 않아야 합니다.');

  // A-06: 문헌조사 보드 지식공백 미정리/정리됨
  w = evaluateAdvancedAlignment({}, emptyLit);
  assert(w.some(x => x.id === 'A-06'), 'A-06은 gap 컬럼과 gapSummary가 모두 비었을 때 감지되어야 합니다.');
  w = evaluateAdvancedAlignment({}, filledLit);
  assert(!w.some(x => x.id === 'A-06'), 'A-06은 gap 컬럼에 카드가 있으면 감지되지 않아야 합니다.');
  w = evaluateAdvancedAlignment({}, filledSummaryLit);
  assert(!w.some(x => x.id === 'A-06'), 'A-06은 gapSummary가 채워지면 감지되지 않아야 합니다.');

  console.log('PASS: A-01 단위 불일치 트리거/비트리거');
  console.log('PASS: A-02 유형 핵심질문 키워드 트리거/비트리거');
  console.log('PASS: A-03 임상/비임상 리스크 미기입 트리거/비트리거 (+ basic 비대상)');
  console.log('PASS: A-04 비임상 Go/No-Go 미기입 트리거/비트리거');
  console.log('PASS: A-05 1차/2차 결과변수 중복 트리거/비트리거');
  console.log('PASS: A-06 문헌조사 지식공백 트리거/비트리거(컬럼/요약 각각)');
}

main();
