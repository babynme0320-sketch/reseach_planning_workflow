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
  await page.evaluate(() => localStorage.removeItem('rd_irb_state'));
  await page.reload({ waitUntil: 'networkidle' });

  await page.click('.nav-item[data-tab="irbhub"]');
  await page.waitForSelector('#view-irbhub.active');
  record('irbhub 탭 활성화', true);

  // AC-1: leaf humanIntervention via q1=yes, q2=yes
  let qText = await page.locator('#irbHubBody .irb-question-text').innerText();
  record('Q1 표시', qText.includes('사람'));
  await page.click('[data-irb-answer="yes"]');
  await page.waitForTimeout(150);
  qText = await page.locator('#irbHubBody .irb-question-text').innerText();
  record('Q2 표시(사람=예 이후)', qText.includes('개입'));
  await page.click('[data-irb-answer="yes"]');
  await page.waitForTimeout(150);
  let leafLabel = await page.locator('#irbHubBody .caution-card h5').innerText();
  record('AC-1: humanIntervention 리프 도달', leafLabel.includes('직접 개입'), leafLabel);

  // AC-3: law chip opens modal
  await page.click('#irbHubBody .irb-law-chip');
  await page.waitForSelector('#lawModalOverlay.open', { timeout: 3000 });
  const modalTitle = await page.locator('#lawModalTitle').innerText();
  record('AC-3: 법령 칩 클릭 시 모달 오픈', modalTitle.includes('생명윤리'), modalTitle);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // AC-2: check a checklist item, reload, verify persisted
  await page.locator('input[data-irb-check="0"]').check();
  await page.waitForTimeout(150);
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('.nav-item[data-tab="irbhub"]');
  await page.waitForSelector('#view-irbhub.active');
  const checkedAfterReload = await page.locator('input[data-irb-check="0"]').isChecked();
  record('AC-2: 체크리스트 새로고침 후 유지', checkedAfterReload);

  // AC-4: reset clears current leaf/answers
  await page.click('#irbResetBtn');
  await page.waitForTimeout(150);
  qText = await page.locator('#irbHubBody .irb-question-text').innerText();
  record('AC-4: 처음부터 다시 → Q1로 복귀', qText.includes('사람'));

  // re-walk to humanIntervention leaf and verify checklist state preserved from before reset
  await page.click('[data-irb-answer="yes"]');
  await page.waitForTimeout(100);
  await page.click('[data-irb-answer="yes"]');
  await page.waitForTimeout(100);
  const checkedAfterReset = await page.locator('input[data-irb-check="0"]').isChecked();
  record('AC-4: 다른 리프 체크 상태는 보존됨(재방문 시 유지)', checkedAfterReset);

  // walk to a different leaf: q1=no, q3=yes -> animal
  await page.click('#irbResetBtn');
  await page.waitForTimeout(100);
  await page.click('[data-irb-answer="no"]');
  await page.waitForTimeout(100);
  qText = await page.locator('#irbHubBody .irb-question-text').innerText();
  record('Q3 표시(사람=아니오 이후)', qText.includes('동물'));
  await page.click('[data-irb-answer="yes"]');
  await page.waitForTimeout(100);
  leafLabel = await page.locator('#irbHubBody .caution-card h5').innerText();
  record('AC-1: animal 리프 도달', leafLabel.includes('동물 대상'), leafLabel);

  // none leaf: q1=no, q3=no
  await page.click('#irbResetBtn');
  await page.waitForTimeout(100);
  await page.click('[data-irb-answer="no"]');
  await page.waitForTimeout(100);
  await page.click('[data-irb-answer="no"]');
  await page.waitForTimeout(100);
  leafLabel = await page.locator('#irbHubBody .caution-card h5').innerText();
  record('AC-1: none 리프 도달', leafLabel.includes('직접 대상 아님'), leafLabel);

  // humanDataOnly leaf: q1=yes, q2=no
  await page.click('#irbResetBtn');
  await page.waitForTimeout(100);
  await page.click('[data-irb-answer="yes"]');
  await page.waitForTimeout(100);
  await page.click('[data-irb-answer="no"]');
  await page.waitForTimeout(100);
  leafLabel = await page.locator('#irbHubBody .caution-card h5').innerText();
  record('AC-1: humanDataOnly 리프 도달', leafLabel.includes('기존 데이터'), leafLabel);

  // AC-5 regression across all 10 tabs
  const tabs = ['dashboard', 'canvas', 'litboard', 'irbhub', 'risks', 'sources', 'glossary', 'orgchart', 'timeline', 'readiness'];
  for (const tab of tabs) {
    await page.click(`.nav-item[data-tab="${tab}"]`);
    await page.waitForSelector(`#view-${tab}.active`, { timeout: 5000 });
    const visible = await page.locator(`#view-${tab}`).isVisible();
    record(`AC-5: ${tab} 탭 정상 표시`, visible);
  }

  record('콘솔 에러 없음', consoleErrors.length === 0, consoleErrors.join(' | '));

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log(`\n총 ${results.length}건 중 실패 ${failed.length}건`);
  process.exit(failed.length > 0 ? 1 : 0);
})();
