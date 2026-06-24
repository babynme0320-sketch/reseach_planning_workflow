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
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.removeItem('rd_canvas_state'); localStorage.removeItem('rd_lit_board_state'); });
  await page.reload({ waitUntil: 'networkidle' });

  await page.click('.nav-item[data-tab="canvas"]');
  await page.waitForSelector('#view-canvas.active');
  let warningsText = await page.locator('#canvasWarnings').innerText();
  record('A-06 배너가 문헌조사 보드 비어있을 때 표시됨', warningsText.includes('A-06'), warningsText.slice(0, 80));

  // fill canvas to trigger A-03/A-04 (nonclinical without risk/goNoGo)
  await page.selectOption('#cv-studyType', 'nonclinical');
  await page.waitForTimeout(300);
  warningsText = await page.locator('#canvasWarnings').innerText();
  record('A-03 배너 표시(비임상+리스크 미기입)', warningsText.includes('A-03'));
  record('A-04 배너 표시(비임상+Go/No-Go 미기입)', warningsText.includes('A-04'));

  await page.fill('#cv-mainRisk', '모델 외삽 실패');
  await page.fill('#cv-goNoGo', '효능 20% 이상');
  await page.waitForTimeout(300);
  warningsText = await page.locator('#canvasWarnings').innerText();
  record('A-03 배너 사라짐(리스크 기입 후)', !warningsText.includes('A-03'));
  record('A-04 배너 사라짐(Go/No-Go 기입 후)', !warningsText.includes('A-04'));

  // go to litboard, add a gap card, return to canvas -> A-06 should disappear
  await page.click('.nav-item[data-tab="litboard"]');
  await page.waitForSelector('#view-litboard.active');
  await page.fill('#litcol-gap-title', '장기 추적 데이터 부족');
  await page.click('[data-lit-add="column|gap"]');
  await page.waitForTimeout(200);

  await page.click('.nav-item[data-tab="canvas"]');
  await page.waitForSelector('#view-canvas.active');
  warningsText = await page.locator('#canvasWarnings').innerText();
  record('A-06 배너 사라짐(문헌조사 보드 gap 카드 추가 후)', !warningsText.includes('A-06'), warningsText.slice(0, 80));

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log(`\n총 ${results.length}건 중 실패 ${failed.length}건`);
  process.exit(failed.length > 0 ? 1 : 0);
})();
