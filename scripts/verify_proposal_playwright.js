// 선택적 검증 스크립트. 프로젝트 의존성에는 playwright를 추가하지 않았으므로
// 실행 전 별도 디렉터리에서 `npm install playwright && npx playwright install chromium` 필요.
// 사전 조건: `python3 -m http.server 8765`로 프로젝트 루트를 띄워둘 것.
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8765/lifecycle.html';
const results = [];
function record(name, ok, detail) { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`); }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('rd_canvas_state');
    localStorage.removeItem('rd_lit_board_state');
    localStorage.removeItem('rd_proposal_state');
  });
  await page.reload({ waitUntil: 'networkidle' });

  // AC-2: empty canvas -> incomplete draft warning
  await page.click('.nav-item[data-tab="proposal"]');
  await page.waitForSelector('#view-proposal.active');
  await page.click('#genProposalDraft');
  await page.waitForTimeout(150);
  let draft = await page.inputValue('#proposalOutput');
  record('AC-2: 캔버스 비어있을 때 미완성 초안 배너', draft.includes('미완성 초안'), draft.slice(0, 60));

  // Fill canvas
  await page.click('.nav-item[data-tab="canvas"]');
  await page.waitForSelector('#view-canvas.active');
  await page.fill('#cv-projectName', '항암 후보물질 A 전임상 효능 평가');
  await page.fill('#cv-researchQuestion', '후보물질 A가 표준 처리 대비 종양 성장을 억제하는가');
  await page.fill('#cv-hypothesis', '후보물질 A는 종양 성장을 억제하는 효능을 가진다');
  await page.fill('#cv-primaryOutcome', '종양 크기 변화율(%)');
  await page.fill('#cv-subjectModel', '대장암 마우스 모델');
  await page.fill('#cv-comparator', '표준치료군');
  await page.fill('#cv-successCriteria', '대조군 대비 20% 이상 감소');
  await page.selectOption('#cv-studyType', 'nonclinical');
  await page.waitForTimeout(200);

  // Fill litboard gapSummary (AC-3)
  await page.click('.nav-item[data-tab="litboard"]');
  await page.waitForSelector('#view-litboard.active');
  await page.fill('#litGapSummary', '장기 추적 데이터 부족');
  await page.waitForTimeout(200);

  // Fill proposal-only fields (AC-4)
  await page.click('.nav-item[data-tab="proposal"]');
  await page.waitForSelector('#view-proposal.active');
  await page.fill('#pp-proposalDuration', '2026.07 ~ 2027.06 (12개월)');
  await page.fill('#pp-proposalStatMethod', '독립표본 t-검정, 유의수준 0.05');
  await page.waitForTimeout(200);

  await page.click('#genProposalDraft');
  await page.waitForTimeout(150);
  draft = await page.inputValue('#proposalOutput');

  record('AC-1: Specific Aims 섹션 포함', draft.includes('## 1. Specific Aims') && draft.includes('종양 크기 변화율'));
  record('AC-1: 목차 섹션 포함', draft.includes('## 2. 목차') && draft.includes('통계분석 계획'));
  record('AC-1: 연구방법/통계계획/일정/리스크 섹션 포함', draft.includes('## 4. 연구 방법 개요') && draft.includes('## 5. 통계분석 계획') && draft.includes('## 6. 연구 일정') && draft.includes('## 7. 주요 리스크'));
  record('AC-2: 필수항목 채운 뒤 미완성 배너 사라짐', !draft.includes('미완성 초안'));
  record('AC-3: 문헌조사 보드 gapSummary 반영', draft.includes('장기 추적 데이터 부족'));
  record('AC-4(부분): 통계분석방법/연구기간 반영', draft.includes('독립표본 t-검정') && draft.includes('2026.07'));

  // AC-4: reload persistence of proposal-only inputs
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('.nav-item[data-tab="proposal"]');
  await page.waitForSelector('#view-proposal.active');
  const durationAfterReload = await page.inputValue('#pp-proposalDuration');
  record('AC-4: 연구기간 새로고침 후 유지', durationAfterReload === '2026.07 ~ 2027.06 (12개월)', durationAfterReload);

  // AC-5: copy and download buttons exist and clickable without error
  await page.click('#genProposalDraft');
  await page.waitForTimeout(100);
  await page.click('#copyProposalDraft');
  await page.waitForTimeout(100);
  const copyBtnText = await page.locator('#copyProposalDraft').innerText();
  record('AC-5: 복사 버튼 클릭 시 피드백 표시', copyBtnText.includes('복사됨'));

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#downloadProposalTxt')
  ]);
  record('AC-5: .txt 다운로드 트리거됨', download.suggestedFilename().endsWith('.txt'), download.suggestedFilename());

  // AC-6: regression across all 11 tabs
  const tabs = ['dashboard', 'canvas', 'litboard', 'irbhub', 'proposal', 'risks', 'sources', 'glossary', 'orgchart', 'timeline', 'readiness'];
  for (const tab of tabs) {
    await page.click(`.nav-item[data-tab="${tab}"]`);
    await page.waitForSelector(`#view-${tab}.active`, { timeout: 5000 });
    const visible = await page.locator(`#view-${tab}`).isVisible();
    record(`AC-6: ${tab} 탭 정상 표시`, visible);
  }

  record('콘솔 에러 없음', consoleErrors.length === 0, consoleErrors.join(' | '));

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log(`\n총 ${results.length}건 중 실패 ${failed.length}건`);
  process.exit(failed.length > 0 ? 1 : 0);
})();
