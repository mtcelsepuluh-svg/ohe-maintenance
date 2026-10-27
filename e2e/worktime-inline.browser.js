// Regression test for the Work Time Sheet inline +/- controls (frontend/src/pages/WorkTimeSheet.tsx).
//
// Drives a real browser against the running app: logs in through the UI, hovers a day
// cell, exercises the inline toolbar (overtime, effective minutes, absence, leave hours,
// reset), and asserts both the rendered grid and the stored document agree.
//
// IMPORTANT: this test WRITES to the database. It records the target cell's original
// state first and restores it in a `finally` block, so a green or red run both leave the
// data as it was. Run it only against a development database.
//
// Prerequisites:
//   - backend  running on API_URL (default http://localhost:5000)   -> `npm run dev` in backend/
//   - frontend running on APP_URL (default http://localhost:3000)   -> `npm run dev` in frontend/
//   - work time sheets exist for the CURRENT month/year (the grid defaults to it)
//   - a Chromium browser; set CHROME_PATH if auto-detection fails
//   - login credentials seeded by create-test-users.js (override with E2E_USER_ID / E2E_PIN)
//
// Usage:  npm run test:e2e        (or: node e2e/worktime-inline.browser.js)
// Exit:   0 all checks passed, 1 one or more checks failed, 2 setup/environment error.
const { chromium } = require('playwright-core');
const fs = require('fs');
const os = require('os');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:5000';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SHOTS_DIR = process.env.E2E_SHOTS_DIR || path.join(os.tmpdir(), 'ohe-e2e-shots');
// Local dev fixture credentials; create-test-users.js is the source of truth.
const LOGIN = {
  user_id: process.env.E2E_USER_ID || 'MEK001',
  pin: process.env.E2E_PIN || '1234'
};

// The grid defaults to the current month, so the API period must match it.
const NOW = new Date();
const YEAR = NOW.getFullYear();
const MONTH = NOW.getMonth() + 1;
const DAYS_IN_MONTH = new Date(YEAR, MONTH, 0).getDate();
// A mid-month weekday: Sundays render as OFF cells with a reduced toolbar.
const TEST_DATE = Array.from({ length: 21 }, (_, i) => i + 8)
  .find(d => d <= DAYS_IN_MONTH && new Date(YEAR, MONTH - 1, d).getDay() !== 0);

let pass = 0, fail = 0;
const results = [];
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  ok ? pass++ : fail++;
  results.push(`  ${ok ? 'PASS' : 'FAIL'} ${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
};
const note = (s) => results.push(s);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const api = async (p, opts = {}, token) => {
  const r = await fetch(`${API_URL}${p}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {})
    }
  });
  return r.json();
};

const assertServerUp = async (url, label, hint) => {
  try {
    await fetch(url);
  } catch (e) {
    throw new Error(`${label} is not reachable at ${url}. ${hint}`);
  }
};

const launchBrowser = async () => {
  const attempts = [];
  if (process.env.CHROME_PATH) attempts.push({ executablePath: process.env.CHROME_PATH });
  attempts.push({ channel: 'chrome' });
  attempts.push({ channel: 'msedge' });
  attempts.push({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  attempts.push({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' });
  let lastErr;
  for (const opts of attempts) {
    try {
      return await chromium.launch({ ...opts, headless: true });
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Could not launch a Chromium browser (set CHROME_PATH to override). Last error: ${lastErr && lastErr.message}`);
};

(async () => {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });

  await assertServerUp(API_URL, 'backend', 'Start it with `npm run dev` inside backend/.');
  await assertServerUp(APP_URL, 'frontend', 'Start it with `npm run dev` inside frontend/.');

  // ---- API side: authenticate, pick a target row, record its original state ----
  const login = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(LOGIN) });
  if (!login.token) {
    throw new Error(`API login failed for ${LOGIN.user_id}: ${JSON.stringify(login)}. Seed credentials with create-test-users.js or set E2E_USER_ID/E2E_PIN.`);
  }
  const token = login.token;

  const meks = (await api('/api/mekaniks', {}, token)).data || [];
  const sheets = (await api(`/api/worktime/${YEAR}/${MONTH}`, {}, token)).data || [];
  if (sheets.length === 0) {
    throw new Error(`No work time sheets for ${YEAR}/${MONTH}. Create them (or run the test in a month that has sheets).`);
  }

  // Same normalized machine_code <-> personel user_id mapping the grid uses to resolve sheets.
  const sheetIdMap = {};
  for (const s of sheets) {
    sheetIdMap[String(s.personel_id?.user_id || '').replace(/-/g, '').toUpperCase()] = s._id;
  }
  const target = meks.find(m => sheetIdMap[String(m.machine_code || '').replace(/-/g, '').toUpperCase()]);
  if (!target) throw new Error('No mekanik row resolves to a work time sheet; cannot pick a test target.');
  const targetName = String(target.nama_mekanik || '').trim();
  const sheetId = sheetIdMap[String(target.machine_code).replace(/-/g, '').toUpperCase()];

  const readEntry = async () => {
    const d = await api(`/api/worktime/${sheetId}`, {}, token);
    return {
      entry: d.data.daily_entries.find(e => e.date === TEST_DATE),
      total_monthly: d.data.total_monthly
    };
  };

  // Poll the API instead of sleeping: saves are async and fixed waits are flaky.
  // On timeout this returns the LAST state rather than throwing, so the assertions
  // below report a readable FAIL (got/expected) instead of an opaque setup error.
  const waitForEntry = async (pred, label, timeoutMs = 8000) => {
    const start = Date.now();
    let last;
    while (Date.now() - start < timeoutMs) {
      last = await readEntry();
      if (pred(last)) return last;
      await sleep(250);
    }
    const e = last && last.entry;
    note(`  (timed out waiting for ${label}; asserting against last state: overtime=${e && e.overtime} total_time=${e && e.total_time} absence=${e && e.absence_type} leave=${e && e.leave_hours})`);
    return last;
  };

  const before = await readEntry();
  const orig = before.entry;
  if (!orig) throw new Error(`Target sheet has no entry for day ${TEST_DATE}.`);
  note(`target row: "${targetName}"  sheet=${sheetId}  period=${YEAR}/${MONTH}  day=${TEST_DATE}`);
  note(`ORIGINAL: total_time=${orig.total_time} overtime=${orig.overtime} std=${orig.standard_time} absence=${orig.absence_type} leave=${orig.leave_hours} total_monthly=${before.total_monthly}`);

  const restore = async () => {
    await api(`/api/worktime/${sheetId}/day/${TEST_DATE}`, {
      method: 'PUT',
      body: JSON.stringify({
        date: TEST_DATE,
        total_time: orig.total_time,
        overtime: orig.overtime,
        absence_type: orig.absence_type ?? null,
        leave_hours: orig.leave_hours || 0,
        status: orig.status,
        remarks: orig.remarks,
        is_manual_overtime: orig.is_manual_overtime
      })
    }, token);
  };

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    const consoleErrors = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

    // ---- Login through the UI ----
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.fill('#user_id', LOGIN.user_id);
    await page.fill('#pin', LOGIN.pin);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
      page.click('button[type="submit"]')
    ]);
    await page.goto(`${APP_URL}/worktime`, { waitUntil: 'networkidle' });
    await page.waitForSelector('table tbody tr', { timeout: 20000 });
    await page.waitForSelector('text=Work Time Sheet', { timeout: 20000 });
    // The sheet list loads after the first paint; give it a beat before measuring.
    await sleep(2500);

    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    note(`\nUI rendered ${rowCount} mekanik rows`);
    check('row count matches API mekaniks', rowCount, meks.length);

    let rowIdx = -1;
    for (let i = 0; i < rowCount; i++) {
      const txt = (await rows.nth(i).locator('td').first().innerText()).trim();
      if (txt === targetName) { rowIdx = i; break; }
    }
    check('target row found in UI', rowIdx >= 0, true);
    if (rowIdx < 0) throw new Error(`target row "${targetName}" not found in the grid`);

    const row = rows.nth(rowIdx);
    const cell = row.locator('td').nth(TEST_DATE); // td[0]=name, td[n]=day n
    const totalCell = row.locator('td').last();
    const readTotal = async () => parseInt((await totalCell.innerText()).split('\n')[0].trim(), 10);

    const totalBefore = await readTotal();
    note(`UI Total column before: ${totalBefore} (API total_monthly=${before.total_monthly})`);
    check('UI Total column equals API total_monthly', totalBefore, before.total_monthly);

    // ---- 1. Hover reveals the toolbar WITHOUT changing row height ----
    const hBefore = (await row.boundingBox()).height;
    await cell.hover();
    await sleep(300);
    const toolbar = cell.locator('div > button[title*="overtime"]').first();
    check('toolbar appears on hover', await toolbar.isVisible(), true);
    check('row height unchanged by hover (no layout jump)', (await row.boundingBox()).height, hBefore);
    await page.screenshot({ path: path.join(SHOTS_DIR, '01-toolbar.png'), clip: await row.boundingBox() });

    // ---- 2. Toolbar clicks must not open the edit modal ----
    await cell.getByRole('button', { name: '+OT', exact: true }).click();
    const afterFirst = await waitForEntry(s => s.entry.overtime === orig.overtime + 10, 'first +OT to persist');
    check('modal did NOT open on toolbar click', await page.locator('.modal').count(), 0);
    check('saved badge shown', (await cell.innerText()).includes('saved'), true);
    check('first +OT persisted', afterFirst.entry.overtime, orig.overtime + 10);

    // ---- 3. Rapid repeated clicks accumulate (no stale-closure collapse) ----
    const otBtn = cell.getByRole('button', { name: '+OT', exact: true });
    await otBtn.click();
    await otBtn.click();
    const afterOT = await waitForEntry(s => s.entry.overtime === orig.overtime + 30, '3x +OT to accumulate');
    note(`\nafter 3x +OT: overtime=${afterOT.entry.overtime} total_time=${afterOT.entry.total_time} total_monthly=${afterOT.total_monthly}`);
    check('overtime accumulated by exactly 30', afterOT.entry.overtime - orig.overtime, 30);
    check('total_time tracks effective+overtime', afterOT.entry.total_time, (orig.total_time - orig.overtime) + afterOT.entry.overtime);
    check('total_monthly grew by 30', afterOT.total_monthly - before.total_monthly, 30);
    check('UI Total column grew by 30', (await readTotal()) - totalBefore, 30);

    // ---- 4. -M reduces effective minutes and preserves overtime ----
    await cell.hover();
    await cell.getByRole('button', { name: '-M', exact: true }).click();
    const afterM = await waitForEntry(s => s.entry.total_time === (orig.total_time - orig.overtime) + orig.overtime + 30 - 10, '-M to persist');
    check('-M reduced total_time by 10', afterM.entry.total_time, (orig.total_time - orig.overtime) + orig.overtime + 20);
    check('-M preserved overtime', afterM.entry.overtime, orig.overtime + 30);

    // ---- 5. Absence -> ijin_sebagian reveals the leave-hours controls ----
    await cell.hover();
    await cell.locator('select').selectOption('ijin_sebagian');
    const afterIS = await waitForEntry(s => s.entry.absence_type === 'ijin_sebagian', 'ijin_sebagian to persist');
    check('absence_type saved as ijin_sebagian', afterIS.entry.absence_type, 'ijin_sebagian');
    check('+h/-h row appears for ijin_sebagian', await cell.getByRole('button', { name: '+h', exact: true }).isVisible(), true);
    await page.screenshot({ path: path.join(SHOTS_DIR, '02-ijin-sebagian.png'), clip: await row.boundingBox() });

    // ---- 6. +h twice -> leave_hours 2, and total_monthly drops by 120 ----
    const tmBeforeLeave = afterIS.total_monthly;
    const hBtn = cell.getByRole('button', { name: '+h', exact: true });
    await hBtn.click();
    await hBtn.click();
    const afterLeave = await waitForEntry(s => (s.entry.leave_hours || 0) === 2, 'leave_hours to reach 2');
    check('leave_hours accumulated to 2', afterLeave.entry.leave_hours, 2);
    check('total_monthly dropped by 120 for 2h leave', tmBeforeLeave - afterLeave.total_monthly, 120);

    // ---- 7. Full-day absence zeroes the day's contribution ----
    await cell.hover();
    await cell.locator('select').selectOption('sakit');
    const afterSakit = await waitForEntry(s => s.entry.absence_type === 'sakit', 'sakit to persist');
    check('absence_type saved as sakit', afterSakit.entry.absence_type, 'sakit');
    check('cell shows SAKIT label', (await cell.innerText()).toUpperCase().includes('SAKIT'), true);

    // ---- 8. reset restores standard_time and clears overtime + absence ----
    await cell.hover();
    await cell.getByRole('button', { name: 'reset', exact: true }).click();
    const afterReset = await waitForEntry(s => s.entry.overtime === 0 && s.entry.absence_type === null, 'reset to persist');
    check('reset -> overtime 0', afterReset.entry.overtime, 0);
    check('reset -> total_time = standard_time', afterReset.entry.total_time, orig.standard_time);
    check('reset -> absence cleared', afterReset.entry.absence_type, null);
    check('reset -> leave_hours cleared', afterReset.entry.leave_hours || 0, 0);
    await page.screenshot({ path: path.join(SHOTS_DIR, '03-after-reset.png'), clip: await row.boundingBox() });

    // ---- 9. Clicking the cell body still opens the full editor ----
    await cell.click({ position: { x: 8, y: 8 } });
    await page.waitForSelector('.modal', { timeout: 5000 });
    check('cell body click opens edit modal', await page.locator('.modal').count(), 1);
    await page.screenshot({ path: path.join(SHOTS_DIR, '04-modal.png') });
    await page.locator('.modal .btn-secondary').click(); // Cancel: must not save
    await sleep(400);

    const realErrors = consoleErrors.filter(e => !/favicon|Download the React DevTools/i.test(e));
    note(`\nconsole errors: ${realErrors.length}`);
    realErrors.slice(0, 6).forEach(e => note('   ' + e.slice(0, 200)));
    check('no unexpected console errors', realErrors.length, 0);
  } finally {
    await restore();
    const v = await readEntry();
    note('\n--- RESTORE ---');
    check('total_time restored', v.entry.total_time, orig.total_time);
    check('overtime restored', v.entry.overtime, orig.overtime);
    check('absence_type restored', v.entry.absence_type ?? null, orig.absence_type ?? null);
    check('leave_hours restored', v.entry.leave_hours || 0, orig.leave_hours || 0);
    check('total_monthly restored', v.total_monthly, before.total_monthly);
    await browser.close();
  }

  console.log(results.join('\n'));
  console.log(`\n${fail === 0 ? 'ALL CHECKS PASSED' : fail + ' CHECK(S) FAILED'}  (${pass} passed, ${fail} failed)`);
  console.log(`screenshots: ${SHOTS_DIR}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => {
  console.error('SETUP ERROR:', e.message);
  if (results.length) console.log(results.join('\n'));
  process.exit(2);
});
