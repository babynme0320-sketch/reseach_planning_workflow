// 선택적 검증 스크립트. 프로젝트 의존성에는 playwright를 추가하지 않았으므로
// 실행 전 별도 디렉터리에서 `npm install playwright && npx playwright install chromium`
// 후 PLAYWRIGHT_BROWSERS_PATH 등을 맞추거나, 해당 디렉터리에서 직접 실행해야 한다.
// 사전 조건: `python3 -m http.server 8765`로 프로젝트 루트를 띄워둘 것.
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8765/lifecycle.html';
const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail: detail || '' });
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

  // start clean
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('rd_lit_board_state'));
  await page.reload({ waitUntil: 'networkidle' });

  await page.click('.nav-item[data-tab="litboard"]');
  await page.waitForSelector('#view-litboard.active', { timeout: 5000 });
  record('litboard 탭 활성화', true);

  const colCount = await page.locator('#litColumnsGrid .lit-column').count();
  record('5컬럼 렌더', colCount === 5, `count=${colCount}`);

  const sideCount = await page.locator('#litSideGrid .lit-column').count();
  record('경쟁연구/실패사례 2개 섹션 렌더', sideCount === 2, `count=${sideCount}`);

  // AC-5: empty title should not add
  await page.click('[data-lit-add="column|standard"]');
  await page.waitForTimeout(200);
  let cardCount = await page.locator('#litColumnsGrid .lit-column').first().locator('.lit-card').count();
  record('AC-5: 빈 제목으로는 카드가 추가되지 않음', cardCount === 0, `count=${cardCount}`);

  // AC-1: add a card to "standard" column
  await page.fill('#litcol-standard-title', '표준 가이드라인 A');
  await page.fill('#litcol-standard-source', 'WHO 2024');
  await page.fill('#litcol-standard-note', '국제 표준 프로토콜');
  await page.click('[data-lit-add="column|standard"]');
  await page.waitForTimeout(200);
  cardCount = await page.locator('#litColumnsGrid .lit-column').first().locator('.lit-card').count();
  record('AC-1: 표준지식 컬럼에 카드 추가', cardCount === 1, `count=${cardCount}`);

  // add a card to each remaining column + side sections for broader coverage
  const colKeys = ['evidence', 'contradiction', 'gap', 'implication'];
  for (const key of colKeys) {
    await page.fill(`#litcol-${key}-title`, `${key} 테스트 항목`);
    await page.click(`[data-lit-add="column|${key}"]`);
  }
  await page.fill('#litside-competitors-title', '경쟁사 X 연구');
  await page.click('[data-lit-add="side|competitors"]');
  await page.fill('#litside-failures-title', '실패사례 Y');
  await page.click('[data-lit-add="side|failures"]');
  await page.waitForTimeout(300);

  const sideCompetitorCount = await page.locator('#litSideGrid .lit-column').nth(0).locator('.lit-card').count();
  const sideFailureCount = await page.locator('#litSideGrid .lit-column').nth(1).locator('.lit-card').count();
  record('AC-3: 경쟁연구 섹션에 카드 추가됨', sideCompetitorCount === 1, `count=${sideCompetitorCount}`);
  record('AC-3: 실패사례 섹션에 카드 추가됨', sideFailureCount === 1, `count=${sideFailureCount}`);

  // AC-4: gap summary persists
  await page.fill('#litGapSummary', '아직 장기 추적 데이터가 부족함');
  await page.waitForTimeout(200);

  // reload and verify persistence (AC-1, AC-3, AC-4)
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('.nav-item[data-tab="litboard"]');
  await page.waitForSelector('#view-litboard.active', { timeout: 5000 });

  const standardCardAfterReload = await page.locator('#litColumnsGrid .lit-column').first().locator('.lit-card-title').first().innerText();
  record('AC-1: 새로고침 후 카드 유지', standardCardAfterReload === '표준 가이드라인 A', standardCardAfterReload);

  const gapValueAfterReload = await page.inputValue('#litGapSummary');
  record('AC-4: 새로고침 후 지식공백 요약 유지', gapValueAfterReload === '아직 장기 추적 데이터가 부족함', gapValueAfterReload);

  // AC-2: delete the standard card and verify persistence after reload
  await page.click('#litColumnsGrid .lit-column >> nth=0 >> .lit-card-delete');
  await page.waitForTimeout(200);
  let standardCountAfterDelete = await page.locator('#litColumnsGrid .lit-column').first().locator('.lit-card').count();
  record('AC-2: 삭제 즉시 반영', standardCountAfterDelete === 0, `count=${standardCountAfterDelete}`);

  await page.reload({ waitUntil: 'networkidle' });
  await page.click('.nav-item[data-tab="litboard"]');
  await page.waitForSelector('#view-litboard.active', { timeout: 5000 });
  standardCountAfterDelete = await page.locator('#litColumnsGrid .lit-column').first().locator('.lit-card').count();
  record('AC-2: 새로고침 후에도 삭제 상태 유지', standardCountAfterDelete === 0, `count=${standardCountAfterDelete}`);

  // AC-6: regression across all tabs
  const tabs = ['dashboard', 'canvas', 'litboard', 'risks', 'sources', 'glossary', 'orgchart', 'timeline', 'readiness'];
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
