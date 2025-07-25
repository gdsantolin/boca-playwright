// ========================================================================
// Copyright Universidade Federal do Espirito Santo (Ufes)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
// This program is released under license GNU GPL v3+ license.
//
// ========================================================================

import { type Locator, type Page } from 'playwright';
import * as fs from 'fs';
import { BASE_URL } from '../index';
import * as path from 'path';
import { type RunType, type GetRun, RunTypeTeam, SubmitRun } from '../data/run';
import { dialogHandler } from '../utils/handlers';
import { RunError, RunMessages } from '../errors/read_errors';

// const statusArr = ['NA', 'YES', 'NO_Compilation', 'NO_Runtime', 'NO_Timelimit', 'NO_Presentation', 'NO_Wrong', 'NO_Contact', 'NO_Name']

async function downloadFile(
  page: Page,
  path: string,
  file: Locator,
  filename?: string
): Promise<void> {
  // Start waiting for download before clicking. Note no await.
  const downloadPromise = page.waitForEvent('download');
  await file.click();
  const download = await downloadPromise;

  // Wait for the download process to complete and save the downloaded file somewhere.
  if (filename == null) filename = download.suggestedFilename();
  await download.saveAs(`${path}/${filename}`);
}

async function saveFiles(
  page: Page,
  link: Locator,
  outDir: string,
  username: string,
  problem: string
): Promise<void> {
  await link.click();

  const statusInt: number = Number(await page.locator('select').inputValue());
  const label = statusInt === 1 ? 'YES' : 'NO';
  let run = await page
    .locator(
      'form > center:nth-of-type(1) > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2)'
    )
    .textContent();
  run = run?.trim() ?? '';

  const dirPath = path.join(outDir, username, problem, `${run}_${label}`);

  // Verify if the folder exist and create it if not
  try {
    fs.accessSync(dirPath);
  } catch {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const code = page.locator(
    'table > tbody > tr:nth-of-type(6) > td:nth-of-type(2) > a:nth-of-type(1)'
  );
  await downloadFile(page, dirPath, code);

  if (statusInt !== 0) {
    const stdout = page.locator(
      'form > center:nth-of-type(3) > table > tbody > tr:nth-of-type(3) > td:nth-of-type(2) a:nth-child(1)'
    );
    await downloadFile(page, dirPath, stdout, 'stdout.txt');

    const stderr = page.locator(
      'form > center:nth-of-type(3) > table > tbody > tr:nth-of-type(4) > td:nth-of-type(2) a:nth-child(1)'
    );
    await downloadFile(page, dirPath, stderr, 'stderr.txt');
  }

  await page.goBack();
}

export async function downloadRuns(page: Page, outDir: string): Promise<void> {
  await page.goto(BASE_URL + '/admin');
  // Wait for load state
  await page.waitForLoadState('domcontentloaded');

  await page.getByRole('link', { name: 'Run' }).click();

  // Get link, username and problem name
  const rows = await page
    .locator('form > table > tbody > tr:nth-of-type(n+2)', {
      hasText: /\d+/
    })
    .all();

  for (const row of rows) {
    const link = row.locator('td:nth-of-type(1) > a');
    const username =
      (await row.locator('td:nth-of-type(3)').textContent()) ?? '';
    const problem =
      (await row.locator('td:nth-of-type(5)').textContent()) ?? '';

    await saveFiles(page, link, outDir, username, problem);
  }
}

export async function downloadRun(
  page: Page,
  runId: GetRun['id'],
  outDir: string
): Promise<void> {
  await page.goto(`${BASE_URL}/admin/run.php`);
  // Wait for load state
  await page.waitForLoadState('domcontentloaded');

  const row = await page.locator('tr', {
    has: await page.locator('td:nth-of-type(1)', { hasText: runId })
  });

  const link = await row.locator('td:nth-of-type(1) > a');

  const username = (await row.locator('td:nth-of-type(3)').textContent()) ?? '';
  const problem = (await row.locator('td:nth-of-type(5)').textContent()) ?? '';

  await saveFiles(page, link, outDir, username, problem);
}

export async function downloadTeamRuns(
  page: Page,
  outDir: string
): Promise<void> {
  await page.goto(BASE_URL + '/team/run.php');
  // Wait for load state
  await page.waitForLoadState('domcontentloaded');

  const rows = await page
    .locator('table:nth-of-type(3) > tbody > tr:nth-of-type(n+2)')
    .all();
  console.log(`Found ${rows.length} runs to download`);
  for (const row of rows) {
    const file = await row.locator('td:nth-of-type(6) > a');
    const filename = (await file.textContent()) ?? 'file';
    await downloadFile(page, outDir, file, filename);
  }
}

export async function downloadTeamRun(
  page: Page,
  runId: GetRun['id'],
  outDir: string
): Promise<void> {
  await page.goto(`${BASE_URL}/team/run.php`);
  // Wait for load state
  await page.waitForLoadState('domcontentloaded');

  // Localiza a linha com o runId na primeira coluna da tabela 3
  const row = page.locator('table:nth-of-type(3) > tbody > tr', {
    has: page.locator('td:nth-of-type(1)', { hasText: runId })
  });
  if ((await row.count()) === 0) throw new RunError(RunMessages.NOT_FOUND);
  // Localiza o link do arquivo (coluna 6)
  const file = await row.locator('td:nth-of-type(6) > a');
  const filename = (await file.textContent()) ?? 'file';

  await downloadFile(page, outDir, file, filename);
}

export async function getRun(
  page: Page,
  runId: GetRun['id']
): Promise<RunType> {
  await page.goto(`${BASE_URL}/admin/run.php`);
  // Wait for load state
  await page.waitForLoadState('domcontentloaded');

  const row = await page.locator('tr', {
    has: await page.locator('td:nth-of-type(1)', { hasText: runId })
  });

  if ((await row.count()) === 0) throw new Error('Run not found');

  const id = await row.locator('td:nth-of-type(1)').textContent();
  const site = await row.locator('td:nth-of-type(2)').textContent();
  const user = await row.locator('td:nth-of-type(3)').textContent();
  const time = await row.locator('td:nth-of-type(4)').textContent();
  const problem = await row.locator('td:nth-of-type(5)').textContent();
  const language = await row.locator('td:nth-of-type(6)').textContent();
  const status = await row.locator('td:nth-of-type(7)').textContent();
  const answer = await row.locator('td:nth-of-type(10)').textContent();

  return {
    id: id ?? '',
    site: site ?? '',
    user: user ?? '',
    time: time ?? '',
    problem: problem ?? '',
    language: language ?? '',
    status: status ?? '',
    answer: answer ?? ''
  };
}

export async function getRuns(page: Page): Promise<RunType[]> {
  await page.goto(`${BASE_URL}/admin/run.php`);
  // Wait for load state
  await page.waitForLoadState('domcontentloaded');

  const rows = await page
    .locator('tr', {
      has: await page.locator('td:nth-of-type(1)', { hasText: /\d+/ })
    })
    .all();

  const runs: RunType[] = [];

  for (const row of rows) {
    const id = await row.locator('td:nth-of-type(1)').textContent();
    const site = await row.locator('td:nth-of-type(2)').textContent();
    const user = await row.locator('td:nth-of-type(3)').textContent();
    const time = await row.locator('td:nth-of-type(4)').textContent();
    const problem = await row.locator('td:nth-of-type(5)').textContent();
    const language = await row.locator('td:nth-of-type(6)').textContent();
    const status = await row.locator('td:nth-of-type(7)').textContent();
    const answer = await row.locator('td:nth-of-type(10)').textContent();

    runs.push({
      id: id?.trim() ?? '',
      site: site ?? '',
      user: user ?? '',
      time: time ?? '',
      problem: problem ?? '',
      language: language ?? '',
      status: status ?? '',
      answer: answer ?? ''
    });
  }
  return runs;
}

export async function getTeamRun(
  page: Page,
  runId: GetRun['id']
): Promise<RunTypeTeam> {
  await page.goto(`${BASE_URL}/team/run.php`);
  // Wait for load state
  await page.waitForLoadState('domcontentloaded');

  const row = await page.locator('tr', {
    has: await page.locator('td:nth-of-type(1)', { hasText: runId })
  });

  if ((await row.count()) === 0) throw new Error('Run not found');

  const id = await row.locator('td:nth-of-type(1)').textContent();
  const time = await row.locator('td:nth-of-type(2)').textContent();
  const problem = await row.locator('td:nth-of-type(3)').textContent();
  const language = await row.locator('td:nth-of-type(4)').textContent();
  const answer = await row.locator('td:nth-of-type(5)').textContent();
  const file = await row.locator('td:nth-of-type(6) > a').textContent();

  return {
    id: id?.trim() ?? '',
    time: time ?? '',
    problem: problem ?? '',
    language: language ?? '',
    answer: answer ?? '',
    file: file ?? ''
  };
}

export async function getTeamRuns(page: Page): Promise<RunTypeTeam[]> {
  await page.goto(`${BASE_URL}/team/run.php`);
  // Wait for load state
  await page.waitForLoadState('domcontentloaded');

  const rows = await page
    .locator('tr', {
      has: await page.locator('td:nth-of-type(1)', { hasText: /\d+/ })
    })
    .all();

  const runs: RunTypeTeam[] = [];

  for (const row of rows) {
    const id = await row.locator('td:nth-of-type(1)').textContent();
    const time = await row.locator('td:nth-of-type(2)').textContent();
    const problem = await row.locator('td:nth-of-type(3)').textContent();
    const language = await row.locator('td:nth-of-type(4)').textContent();
    const answer = await row.locator('td:nth-of-type(5)').textContent();
    const file = await row.locator('td:nth-of-type(6) > a').textContent();

    runs.push({
      id: id?.trim() ?? '',
      time: time ?? '',
      problem: problem ?? '',
      language: language ?? '',
      answer: answer ?? '',
      file: file ?? ''
    });
  }
  return runs;
}

// Team-only method
export async function submitRun(
  page: Page,
  run: SubmitRun
): Promise<RunTypeTeam[]> {
  await page.goto(`${BASE_URL}/team/run.php`);
  await page.waitForLoadState('domcontentloaded');

  // Fill the form
  await page.locator('select[name="problem"]').selectOption(run.problem);
  await page.locator('select[name="language"]').selectOption(run.language);
  await page
    .locator('input[type="file"][name="sourcefile"]')
    .setInputFiles(run.filePath);

  page.once('dialog', dialogHandler);
  await page.locator('input[type="submit"][name="Submit"]').click();
  return await getTeamRuns(page);
}
