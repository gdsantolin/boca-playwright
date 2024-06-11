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

import { z } from 'zod';
import { type Setup } from './setup';
import { type User, userIdSchema, importUsersSchema, userSchema } from './user';
import { loginSchema } from './auth';
import { siteSchema } from './site';
import { problemIdSchema, problemSchema } from './problem';
import { languageIdSchema, languageSchema } from './language';
import {
  contestSchema,
  createContestSchema,
  updateContestSchema
} from './contest';
import { reportSchema } from './report';
import { AuthError, AuthMessages } from '../errors/read_errors';
import { type Page } from 'playwright';

export class Validate {
  constructor(public setup: Setup) {}

  async checkLoginType(
    page: Page,
    type: User['type'] | 'System'
  ): Promise<void> {
    // Wait for load state
    await page.waitForLoadState('domcontentloaded');
    // Get url from page
    const url = await page.url();
    // Get the type from the url
    const typeUrl = url.split('/').at(-2) as unknown as User['type'];
    // Compare the types
    if (type && type.toLocaleLowerCase() !== typeUrl) {
      throw new AuthError(
        AuthMessages.INVALID_TYPE,
        `Expected type ${type} but got ${typeUrl}`
      );
    }
  }

  createContest(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      contest: createContestSchema.optional()
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  getContest(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      contest: contestSchema.pick({ id: true })
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  getContests(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  updateContest(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      contest: updateContestSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  createLanguage(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      language: languageSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  getLanguage(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      language: languageIdSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  getLanguages(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  createProblem(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      problem: problemSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  deleteProblem(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      problem: problemIdSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  getProblem() {
    const setupType = z.object({
      login: loginSchema,
      problem: problemIdSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  getProblems(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  createUser(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      user: userSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  deleteUser(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      user: userIdSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  getUser(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      user: userIdSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  getUsers(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  importUsers(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      config: importUsersSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  createSite(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      site: siteSchema // TODO - Review if it should be optional
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  generateReport(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      config: reportSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }
}
