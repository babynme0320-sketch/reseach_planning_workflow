#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'lifecycle.html');

function extractInlineScript(html) {
  const match = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/i);
  if (!match) {
    throw new Error('lifecycle.html에서 마지막 inline script를 찾지 못했습니다.');
  }
  return match[1];
}

function createSandbox() {
  const noop = () => {};
  const fakeElement = () => ({
    value: '',
    innerHTML: '',
    innerText: '',
    textContent: '',
    style: {},
    options: [],
    checked: false,
    disabled: false,
    className: '',
    dataset: {},
    appendChild: noop,
    removeChild: noop,
    addEventListener: noop,
    querySelector: () => fakeElement(),
    querySelectorAll: () => [],
    setAttribute: noop,
    removeAttribute: noop,
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    focus: noop,
    select: noop
  });

  const elements = new Map();
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, fakeElement());
    return elements.get(id);
  };

  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    Blob,
    URL: {
      createObjectURL: () => 'blob:mock',
      revokeObjectURL: noop
    },
    navigator: {
      clipboard: {
        writeText: async () => {}
      }
    },
    alert: noop,
    confirm: () => true,
    localStorage: {
      _store: new Map(),
      getItem(key) {
        return this._store.has(key) ? this._store.get(key) : null;
      },
      setItem(key, value) {
        this._store.set(key, String(value));
      },
      removeItem(key) {
        this._store.delete(key);
      }
    },
    document: {
      addEventListener: noop,
      querySelector: () => fakeElement(),
      querySelectorAll: () => [],
      createElement: () => fakeElement(),
      getElementById: getElement,
      body: fakeElement(),
      documentElement: { style: { setProperty: noop } },
      activeElement: null,
      execCommand: () => true
    },
    window: {
      location: { hash: '' },
      requestAnimationFrame: (cb) => cb()
    }
  };

  sandbox.globalThis = sandbox;
  return sandbox;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const scriptBody = extractInlineScript(html);

  // Syntax validation
  new Function(scriptBody);

  const sandbox = createSandbox();
  const instrumented = `${scriptBody}
globalThis.__testHooks = {
  evaluateCanvas,
  buildConceptNote,
  STUDY_TYPES,
  setCanvasState: (next) => { canvasState = next; }
};`;

  vm.createContext(sandbox);
  vm.runInContext(instrumented, sandbox, { filename: 'lifecycle-inline.js' });

  const hooks = sandbox.__testHooks;
  assert(hooks, '__testHooks 노출 실패');

  const studyTypeKeys = Object.keys(hooks.STUDY_TYPES);
  assert(studyTypeKeys.length === 6, `연구 유형은 6개여야 합니다. 현재: ${studyTypeKeys.length}`);
  studyTypeKeys.forEach((key) => {
    const type = hooks.STUDY_TYPES[key];
    assert(type.label && type.coreQuestion, `${key} 유형의 label/coreQuestion이 필요합니다.`);
    assert(Array.isArray(type.deliverables) && type.deliverables.length > 0, `${key} 유형의 deliverables가 비어 있습니다.`);
    assert(Array.isArray(type.risks) && type.risks.length > 0, `${key} 유형의 risks가 비어 있습니다.`);
    assert(Array.isArray(type.checklist) && type.checklist.length > 0, `${key} 유형의 checklist가 비어 있습니다.`);
  });

  const empty = hooks.evaluateCanvas({});
  assert(empty.some((w) => w.id === 'C-01'), '빈 상태에서 C-01이 감지되어야 합니다.');
  assert(empty.some((w) => w.id === 'C-07'), '빈 상태에서 C-07이 감지되어야 합니다.');

  const aligned = hooks.evaluateCanvas({
    researchQuestion: '후보물질 A가 표준 처리 대비 종양 성장을 억제하는가',
    hypothesis: '후보물질 A는 종양 성장을 억제하는 효능을 가진다',
    primaryOutcome: '종양 크기 변화율(%)',
    subjectModel: '대장암 마우스 모델',
    comparator: '표준치료군',
    successCriteria: '대조군 대비 20% 이상 감소',
    studyType: 'nonclinical'
  });
  assert(aligned.length === 0, '정합한 입력에서는 경고가 없어야 합니다.');

  const mismatch = hooks.evaluateCanvas({
    researchQuestion: '후보물질 A가 표준 처리 대비 종양 성장을 억제하는가',
    hypothesis: '후보물질 A는 종양 성장을 억제하는 효능을 가진다',
    primaryOutcome: '간 독성 발생률',
    subjectModel: '대장암 마우스 모델',
    comparator: '표준치료군',
    successCriteria: '대조군 대비 20% 이상 감소',
    studyType: 'nonclinical'
  });
  assert(mismatch.some((w) => w.id === 'C-06'), '효능/안전성 불일치에서 C-06이 감지되어야 합니다.');

  hooks.setCanvasState({
    projectName: '항암 후보물질 A 전임상 효능 평가',
    researchQuestion: '후보물질 A가 표준 처리 대비 종양 성장을 억제하는가',
    hypothesis: '후보물질 A는 종양 성장을 억제하는 효능을 가진다',
    primaryOutcome: '종양 크기 변화율(%)',
    subjectModel: '대장암 마우스 모델',
    comparator: '표준치료군',
    successCriteria: '대조군 대비 20% 이상 감소',
    studyType: 'nonclinical',
    secondaryOutcomes: '체중 변화, 생존 기간',
    expectedImpact: '후속 IND 진입 여부 판단',
    mainRisk: '모델 외삽 실패',
    goNoGo: '효능 20% 이상, 중대한 독성 없음'
  });

  const noteText = hooks.buildConceptNote('text');
  assert(noteText.includes('핵심 방법: 비임상/전임상'), '텍스트 노트에 유형 라벨이 반영되어야 합니다.');
  assert(noteText.includes('1차 결과변수: 종양 크기 변화율(%)'), '텍스트 노트에 1차 결과변수가 포함되어야 합니다.');

  const noteMd = hooks.buildConceptNote('md');
  assert(noteMd.includes('**핵심 방법**: 비임상/전임상'), 'Markdown 노트에 유형 라벨이 반영되어야 합니다.');
  assert(!noteMd.includes('미완성 초안'), '필수값이 채워진 Markdown 노트에는 미완성 표식이 없어야 합니다.');

  hooks.setCanvasState({
    projectName: '항암 후보물질 A 전임상 효능 평가',
    researchQuestion: '',
    hypothesis: '',
    primaryOutcome: '',
    subjectModel: '',
    comparator: '',
    successCriteria: '',
    studyType: '',
    secondaryOutcomes: '',
    expectedImpact: '',
    mainRisk: '',
    goNoGo: ''
  });

  const draft = hooks.buildConceptNote('md');
  assert(draft.includes('미완성 초안'), '필수값 누락 시 미완성 초안 표시가 있어야 합니다.');

  console.log('PASS: lifecycle inline script syntax');
  console.log('PASS: STUDY_TYPES definition coverage');
  console.log('PASS: evaluateCanvas empty/aligned/mismatch cases');
  console.log('PASS: buildConceptNote complete text/markdown output');
  console.log('PASS: buildConceptNote incomplete-draft marker');
}

main();
