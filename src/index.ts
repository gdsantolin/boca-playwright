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

import { Option, program } from 'commander';
import * as fs from 'fs';
import { chromium } from 'playwright';
import { exit } from 'process';
import { ZodError } from 'zod';
import { type CreateContest, type UpdateContest } from './data/contest';
import { type Login } from './data/auth';
import { type Problem } from './data/problem';
import { setupSchema, type Setup } from './data/setup';
import { type Site } from './data/site';
import { type User } from './data/user';
import { Validate } from './data/validate';
import { ExitErrors, ReadMessages } from './errors/read_errors';
import { Logger } from './logger';
import { Output } from './output';
import { login } from './scripts/auth';
import {
  activateContest,
  createContest,
  getContest,
  getContests,
  updateContest
} from './scripts/contest';
import {
  createLanguage,
  deleteLanguage,
  getLanguage,
  getLanguages
} from './scripts/language';
import {
  createProblem,
  deleteProblem,
  getProblem,
  getProblems
} from './scripts/problem';
import { retrieveFiles } from './scripts/report';
import { createSite } from './scripts/site';
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  importUsers
} from './scripts/user';

const STEP_DURATION = 50;
const HEADLESS = true;
let TIMEOUT = 3000;
export let BASE_URL = 'http://localhost:8000/boca';

//#region Contest
async function shouldActivateContest(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Activating contest');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getContest();
  const system: Login = setupValidated.login;
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
  logger.logInfo('Logging in with system user: %s', system.username);
  await login(page, system);
  await validate.checkLoginType(page, 'System');
  const form = await activateContest(page, contest.id, system);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Contest activated with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldCreateContest(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating contest');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createContest();
  const system: Login = setupValidated.login;
  const contest: CreateContest | undefined = setupValidated.contest;

  // create contest
  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  logger.logInfo('Logging in with system user: %s', system.username);
  await login(page, system);
  await validate.checkLoginType(page, 'System');
  logger.logInfo('Creating contest');
  const form = await createContest(page, contest);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Contest created with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldGetContest(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting contest');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getContest();
  const system: Login = setupValidated.login;
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
  logger.logInfo('Logging in with system user: %s', system.username);
  await login(page, system);
  await validate.checkLoginType(page, 'System');
  const form = await getContest(page, contest.id);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Contest found with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldGetContests(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting contests');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getContests();
  const system: Login = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  logger.logInfo('Logging in with system user: %s', system.username);
  await login(page, system);
  await validate.checkLoginType(page, 'System');
  const form = await getContests(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s contests', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldUpdateContest(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Update contest');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.updateContest();
  const system: Login = setupValidated.login;
  const contest: UpdateContest = setupValidated.contest;

  // create contest
  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  logger.logInfo('Logging in with system user: %s', system.username);
  await login(page, system);
  await validate.checkLoginType(page, 'System');
  const form = await updateContest(page, contest);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Contest updated with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}
//#endregion

//#region Languages
async function shouldCreateLanguage(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating/Updating language');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createLanguage();
  const admin: Login = setupValidated.login;
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
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await createLanguage(page, language);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Language created/updated with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldDeleteLanguage(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting language');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getLanguage();
  const admin: Login = setupValidated.login;
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
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await deleteLanguage(page, language);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Language deleted with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldGetLanguage(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting language');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getLanguage();
  const admin: Login = setupValidated.login;
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
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await getLanguage(page, language);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Language found with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldGetLanguages(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting languages');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getLanguages();
  const admin: Login = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await getLanguages(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s languages', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}
//#endregion

//#region Problem
async function shouldCreateProblem(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating/Updating problem');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createProblem();
  const admin: Login = setupValidated.login;
  const problem: Problem = setupValidated.problem;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await createProblem(page, problem);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Problem created/updated with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldDeleteProblem(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting problem');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getProblem();
  const admin: Login = setupValidated.login;
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
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await deleteProblem(page, problem);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Problem deleted with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldGetProblem(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting problem');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getProblem();
  const admin: Login = setupValidated.login;
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
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await getProblem(page, problem);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Problem found with name: %s', form.name);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldGetProblems(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting problems');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getProblems();
  const admin: Login = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await getProblems(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s problems', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}
//#endregion

//#region User
async function shouldCreateUser(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating users');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createUser();
  const admin: Login = setupValidated.login;
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
  logger.logInfo('Logging in with admin user: %s', admin.username);
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  logger.logInfo('Creating user: %s', user.username);
  await createUser(page, user, admin);
  const form = await getUser(page, user);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('User created with id: %s', form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldDeleteUser(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Deleting users');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getUser();
  const admin: Login = setupValidated.login;
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
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await deleteUser(page, userId, admin);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('User deleted with site: %s and id: %s', form.siteId, form.id);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldGetUser(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting user');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getUser();
  const admin: Login = setupValidated.login;
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
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await getUser(page, userId);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('User found with name: %s', form.username);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldGetUsers(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Getting users');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.getUsers();
  const admin: Login = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  const form = await getUsers(page);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
  logger.logInfo('Found %s users', form.length);
  const output = Output.getInstance();
  output.setResult(form);
}

async function shouldImportUsers(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating users');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.importUsers();
  const userPath = setupValidated.config.userPath;
  const admin: Login = setupValidated.login;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  logger.logInfo('Logging in with admin user: %s', admin.username);
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  logger.logInfo('Importing users from file: %s', userPath);
  await importUsers(page, userPath);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
}
//#endregion

//#region Site
async function shouldCreateSite(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Creating site');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.createSite();
  const admin: Login = setupValidated.login;
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
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  await createSite(page, site);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
}
//#endregion

//#region Reports
async function shouldGenerateReport(setup: Setup): Promise<void> {
  // instantiate logger
  const logger = Logger.getInstance();
  logger.logInfo('Generating reports');

  // validate setup file with zod
  const validate = new Validate(setup);
  const setupValidated = validate.generateReport();
  const admin: Login = setupValidated.login;
  const outDir = setupValidated.config.outReportDir;

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: STEP_DURATION
  });
  // Create a new incognito browser context
  const context = await browser.newContext();
  // Create a new page inside context.
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await login(page, admin);
  await validate.checkLoginType(page, 'Admin');
  await retrieveFiles(page, outDir);
  // Dispose context once it's no longer needed.
  await context.close();
  await browser.close();
}

//#endregion

const methods: Record<string, (setup: Setup) => Promise<void>> = {
  // Contests
  createContest: shouldCreateContest,
  updateContest: shouldUpdateContest,
  getContest: shouldGetContest,
  getContests: shouldGetContests,
  activateContest: shouldActivateContest,
  // Languages
  createLanguage: shouldCreateLanguage,
  deleteLanguage: shouldDeleteLanguage,
  getLanguage: shouldGetLanguage,
  getLanguages: shouldGetLanguages,
  updateLanguage: shouldCreateLanguage,
  // Problems
  createProblem: shouldCreateProblem,
  deleteProblem: shouldDeleteProblem,
  getProblem: shouldGetProblem,
  getProblems: shouldGetProblems,
  updateProblem: shouldCreateProblem,
  // Sites
  createSite: shouldCreateSite,
  // Users
  createUser: shouldCreateUser,
  deleteUser: shouldDeleteUser,
  getUser: shouldGetUser,
  getUsers: shouldGetUsers,
  importUsers: shouldImportUsers,
  updateUser: shouldCreateUser,
  // Reports
  generateReport: shouldGenerateReport
};

function main(): number {
  program
    .name('boca-cli')
    .description('CLI for Boca')
    .version('0.1.0')
    .requiredOption('-p, --path <path>', 'path to config file')
    .addOption(
      new Option('-m, --method <method>', 'method to execute')
        .choices(Object.keys(methods))
        .makeOptionMandatory()
    )
    .option('-t, --timeout <timeout>', 'timeout for playwright', '30000')
    .option('-v, --verbose', 'verbose mode')
    .parse();

  const { path, method, verbose, timeout } = program.opts();
  const logger = Logger.getInstance(verbose);
  const output = Output.getInstance();

  // Check if path to config file is set and if it exists
  if (!fs.existsSync(path)) {
    logger.logError(ReadMessages.CONFIG_NOT_FOUND);
    exit(ExitErrors.ARGS_VALIDATION);
  }

  const setup = JSON.parse(fs.readFileSync(path, 'utf8')) as Setup;
  try {
    setupSchema.parse(setup);
  } catch (e) {
    if (e instanceof ZodError) logger.logZodError(e);
    exit(ExitErrors.CONFIG_VALIDATION);
  } finally {
    logger.logInfo('Using setup file: %s', path);
  }
  BASE_URL = setup.config.url;
  TIMEOUT = parseInt(timeout);

  const func = methods[method];
  func(setup)
    .then(() => {
      logger.logInfo('Done!');
      if (output.isActive) {
        logger.logInfo('Output file: %s', setup.config.resultFilePath!);
        output.writeFile(setup.config.resultFilePath!);
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .catch((e) => {
      // OBS instanceof ErrorBase didn't work
      if (e['code'] !== undefined) {
        logger.logErrorBase(e);
        exit(e.code);
      }
      logger.logError(e);
      exit(ExitErrors.CONFIG_VALIDATION);
    });

  return ExitErrors.OK;
}

main();
