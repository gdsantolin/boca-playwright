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

import { chromium } from 'playwright';
import { type Auth } from './data/auth';
import { type CreateContest, type UpdateContest } from './data/contest';
import { type CreateProblem, type UpdateProblem } from './data/problem';
import { type Setup } from './data/setup';
import { type Site } from './data/site';
import { type User } from './data/user';
import { Validate } from './data/validate';
import { Logger } from './logger';
import { Output } from './output';
import { authenticateUser } from './scripts/auth';
import {
  activateContest,
  createContest,
  getContest,
  getContests,
  updateContest
} from './scripts/contest';
import {
  createAnswer,
  deleteAnswer,
  deleteAnswers,
  getAnswer,
  getAnswers,
  updateAnswer
} from './scripts/answer';
import {
  createLanguage,
  deleteLanguage,
  deleteLanguages,
  getLanguage,
  getLanguages,
  updateLanguage
} from './scripts/language';
import {
  createProblem,
  deleteProblem,
  deleteProblems,
  downloadProblem,
  downloadTeamProblem,
  getProblem,
  getProblems,
  getTeamProblem,
  restoreProblem,
  restoreProblems,
  updateProblem
} from './scripts/problem';
import {
  createSite,
  disableLoginSite,
  enableLoginSite,
  forceLogoffSite,
  getSite,
  getSites,
  updateSite
} from './scripts/site';
import {
  createUser,
  deleteUser,
  deleteUsers,
  getUser,
  getUsers,
  importUsers,
  restoreUser,
  restoreUsers,
  updateUser
} from './scripts/user';
import {
  downloadRun,
  downloadRuns,
  getRun,
  getRuns,
  getTeamRun,
  getTeamRuns,
  submitRun
} from './scripts/run';

const STEP_DURATION = 100;
const HEADLESS = true;
const TIMEOUT = 5000;
export const BASE_URL = 'http://localhost:8000/boca';

//#region Contest
export async function shouldActivateContest(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Activating contest');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getContest();
  const system: Auth = setupValidated.login;
  const contest = setupValidated.contest;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, system);
  await validate.checkUserType(page, 'System');
  const form = await activateContest(page, contest.id, system);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Activated contest with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldCreateContest(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating contest');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createContest();
  const system: Auth = setupValidated.login;
  const contest: CreateContest | undefined = setupValidated.contest;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, system);
  await validate.checkUserType(page, 'System');
  const form = await createContest(page, contest);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Created contest with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetContest(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting contest');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getContest();
  const system: Auth = setupValidated.login;
  const contest = setupValidated.contest;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, system);
  await validate.checkUserType(page, 'System');
  const form = await getContest(page, contest.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found contest with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetContests(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting contests');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const system: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, system);
  await validate.checkUserType(page, 'System');
  const form = await getContests(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s contests', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldUpdateContest(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Update contest');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.updateContest();
  const system: Auth = setupValidated.login;
  const contest: UpdateContest = setupValidated.contest;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, system);
  await validate.checkUserType(page, 'System');
  const form = await updateContest(page, contest);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Updated contest with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}
//#endregion

//#region Answers
export async function shouldCreateAnswer(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating answer');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createAnswer();
  const admin: Auth = setupValidated.login;
  const answer = setupValidated.answer;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await createAnswer(page, answer);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Created answer with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDeleteAnswer(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting answer');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getAnswer();
  const admin: Auth = setupValidated.login;
  const answer = setupValidated.answer;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await deleteAnswer(page, answer.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Deleted answer with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDeleteAnswers(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting answers');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await deleteAnswers(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Deleted %s answers', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetAnswer(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting answer');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getAnswer();
  const admin: Auth = setupValidated.login;
  const answer = setupValidated.answer;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await getAnswer(page, answer.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found answer with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetAnswers(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting answers');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await getAnswers(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s answers', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldUpdateAnswer(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Updating answer');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createAnswer();
  const admin: Auth = setupValidated.login;
  const answer = setupValidated.answer;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await updateAnswer(page, answer);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Updated answer with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}
//#endregion

//#region Languages
export async function shouldCreateLanguage(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating language');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createLanguage();
  const admin: Auth = setupValidated.login;
  const language = setupValidated.language;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await createLanguage(page, language);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Created language with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDeleteLanguage(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting language');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getLanguage();
  const admin: Auth = setupValidated.login;
  const language = setupValidated.language;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await deleteLanguage(page, language.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Deleted language with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDeleteLanguages(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting languages');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await deleteLanguages(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s languages', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetLanguage(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting language');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getLanguage();
  const admin: Auth = setupValidated.login;
  const language = setupValidated.language;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await getLanguage(page, language.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found language with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetLanguages(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting languages');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await getLanguages(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s languages', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldUpdateLanguage(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Updating language');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createLanguage();
  const admin: Auth = setupValidated.login;
  const language = setupValidated.language;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await updateLanguage(page, language);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Updated language with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}
//#endregion

//#region Problem
export async function shouldCreateProblem(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating problem');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createProblem();
  const admin: Auth = setupValidated.login;
  const problem: CreateProblem = setupValidated.problem;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await createProblem(page, problem);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Created problem with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDeleteProblem(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting problem');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getProblem();
  const admin: Auth = setupValidated.login;
  const problem = setupValidated.problem;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await deleteProblem(page, problem.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Deleted problem with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDeleteProblems(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting problems');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await deleteProblems(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Deleted %s problems', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDownloadProblem(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Downloading problem file(s)');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const auth: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, auth);
  const userType = auth.type;
  await validate.checkUserType(page, userType);
  let problem;
  if (userType == 'Admin') {
    problem = validate.downloadProblem().problem;
    await downloadProblem(page, problem);
    logger.logInfo('Downloaded file(s) of problem with id: %s', problem.id);
  } else {
    problem = validate.downloadTeamProblem().problem;
    await downloadTeamProblem(page, problem);
    logger.logInfo('Downloaded file(s) of problem with name: %s', problem.name);
  }

  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
}

export async function shouldGetProblem(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting problem');

  // validate setup file with zod
  const validate = new Validate(setup);
  const auth = validate.checkAuthentication().login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, auth);
  const userType = auth.type;
  await validate.checkUserType(page, userType);

  let form, problem;
  if (userType == 'Admin') {
    problem = validate.getProblem().problem;
    form = await getProblem(page, problem.id);
    logger.logInfo('Found problem with id: %s', form.id);
  } else {
    problem = validate.getTeamProblem().problem;
    form = await getTeamProblem(page, problem.name);
    logger.logInfo('Found problem with name: %s', form.name);
  }
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetProblems(setup: Setup): Promise<void> {
  const logger = Logger.getInstance();
  logger.logInfo('Getting problems');

  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const auth: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);

  await authenticateUser(page, auth);

  const userType = auth.type;
  await validate.checkUserType(page, userType);
  const form = await getProblems(page, userType);

  await context.close();
  await browser.close();

  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldRestoreProblem(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Restoring problem');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getProblem();
  const admin: Auth = setupValidated.login;
  const problem = setupValidated.problem;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await restoreProblem(page, problem.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Restored problem with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldRestoreProblems(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Restoring problems');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await restoreProblems(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Restored %s problems', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldUpdateProblem(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Updating problem');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.updateProblem();
  const admin: Auth = setupValidated.login;
  const problem: UpdateProblem = setupValidated.problem;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await updateProblem(page, problem);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Updated problem with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}
//#endregion

//#region Site
export async function shouldCreateSite(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating site');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createSite();
  const admin: Auth = setupValidated.login;
  const site: Site = setupValidated.site;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await createSite(page, site);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Created site with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDisableLoginSite(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Disabling user login in site');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getSite();
  const admin: Auth = setupValidated.login;
  const site = setupValidated.site;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  await disableLoginSite(page, site.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Disabled user login in site with id: %s', site.id);
}

export async function shouldEnableLoginSite(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Enabling user login in site');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getSite();
  const admin: Auth = setupValidated.login;
  const site = setupValidated.site;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  await enableLoginSite(page, site.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Enabled user login in site with id: %s', site.id);
}

export async function shouldForceLogoffSite(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Forcing user logoff from site');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getSite();
  const admin: Auth = setupValidated.login;
  const site = setupValidated.site;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  await forceLogoffSite(page, site.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Forced user logoff from site with id: %s', site.id);
}

export async function shouldGetSite(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting site');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getSite();
  const admin: Auth = setupValidated.login;
  const site = setupValidated.site;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await getSite(page, site.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found site with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetSites(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting sites');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await getSites(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s sites', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldUpdateSite(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Update site');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createSite();
  const admin: Auth = setupValidated.login;
  const site: Site = setupValidated.site;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await updateSite(page, site);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Updated site with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}
//#endregion

//#region User
export async function shouldCreateUser(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating user');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createUser();
  const admin: Auth = setupValidated.login;
  const user: User = setupValidated.user;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await createUser(page, user, admin);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Created user with id/site: %s/%s', form.id, form.siteId);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDeleteUser(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting/Disabling user');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getUser();
  const admin: Auth = setupValidated.login;
  const userId = setupValidated.user;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await deleteUser(page, userId);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo(
    'Deleted/Disabled user with id/site: %s/%s',
    form.id,
    form.siteId
  );
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldDeleteUsers(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting users');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await deleteUsers(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Deleted %s users', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetUser(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting user');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getUser();
  const admin: Auth = setupValidated.login;
  const user = setupValidated.user;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await getUser(page, user);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('User found with id/site: %s/%s', form.id, form.siteId);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetUsers(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting users');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await getUsers(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s users', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldImportUsers(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Importing users from file');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.importUsers();
  const userPath = setupValidated.config.userPath;
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  logger.logInfo('Authenticating with admin user: %s', admin.username);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  logger.logInfo('Importing users from file: %s', userPath);
  await importUsers(page, userPath);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Imported users from file');
}

export async function shouldRestoreUser(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Restoring/Enabling user');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getUser();
  const admin: Auth = setupValidated.login;
  const userId = setupValidated.user;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await restoreUser(page, userId, admin);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo(
    'Restored/Enabled user with id/site: %s/%s',
    form.id,
    form.siteId
  );
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldRestoreUsers(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Restoring users');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.checkAuthentication();
  const admin: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await restoreUsers(page, admin);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Restored %s users', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldUpdateUser(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Updating user');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createUser();
  const admin: Auth = setupValidated.login;
  const user: User = setupValidated.user;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  const form = await updateUser(page, user, admin);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Updated user with id/site: %s/%s', form.id, form.siteId);
  const output = Output.getInstance();
  output.setResult(form);
}
//#endregion

//#region Reports
export async function shouldDownloadRuns(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Downloading runs');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.downloadRuns();
  const admin: Auth = setupValidated.login;
  const outDir = setupValidated.config.runPath;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await validate.checkUserType(page, 'Admin');
  await downloadRuns(page, outDir);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
}

export async function shouldDownloadRun(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Downloading run');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.downloadRun();
  const admin: Auth = setupValidated.login;
  const runId = setupValidated.run.id;
  const outDir = setupValidated.config.runPath;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, admin);
  await downloadRun(page, runId, outDir);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
}

export async function shouldGetRun(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting run');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getRun();
  const auth: Auth = setupValidated.login;
  const runId = setupValidated.run.id;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await authenticateUser(page, auth);
  const userType = auth.type;
  await validate.checkUserType(page, userType);
  let form;
  if (userType == 'Admin') {
    form = await getRun(page, runId);
  } else {
    form = await getTeamRun(page, runId);
  }
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found run with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldGetRuns(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting runs');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getRuns();
  const auth: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  await authenticateUser(page, auth);
  const userType = auth.type;
  await validate.checkUserType(page, userType);
  let form;
  if (userType == 'Admin') {
    form = await getRuns(page);
  } else {
    form = await getTeamRuns(page);
  }
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s runs', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

export async function shouldSubmitRun(setup: Setup): Promise<void> {
  const logger = Logger.getInstance();
  logger.logInfo('Submitting run');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.submitRun();
  const team: Auth = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  await authenticateUser(page, team);
  const userType = team.type;
  await validate.checkUserType(page, userType);

  const form = await submitRun(page, setupValidated.run);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  //logger.logInfo('Created run with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

//#endregion

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    const { interactiveCLI } = await import('./cli/interactive'); // Avoid circular dependency
    await interactiveCLI();
  } else {
    const { legacyCLI } = await import('./cli/legacy'); // Avoid circular dependency
    legacyCLI();
  }
}

main();
