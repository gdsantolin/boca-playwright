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
import { deleteUserSchema, userSchema } from './user';
import { loginSchema } from './login';
import { siteSchema } from './site';
import { problemSchema } from './problem';
import { deleteLanguageSchema, languageSchema } from './language';
import { contestSchema, createContestSchema } from './contest';

export class Validate {
  private readonly insertUsersSchema = z.object({
    userPath: z.string()
  });

  private readonly createProblemsSchema = z.array(problemSchema);

  private readonly createLanguagesSchema = z.array(languageSchema);

  private readonly deleteLanguagesSchema = z.array(deleteLanguageSchema);

  private readonly generateReportSchema = z.object({
    outDir: z.string()
  });

  constructor(public setup: Setup) {}

  createContest(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      contest: createContestSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  updateContest(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      contest: contestSchema
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

  insertUsers(): z.infer<typeof setupType> {
    const setupType = z.object({
      config: this.insertUsersSchema,
      login: loginSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  deleteUser(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      user: deleteUserSchema
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

  createProblems(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      problems: this.createProblemsSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  createLanguages(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      languages: this.createLanguagesSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }

  deleteLanguages(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      languages: this.deleteLanguagesSchema
    });
    return this.setup as z.infer<typeof setupType>;
  }

  generateReport(): z.infer<typeof setupType> {
    const setupType = z.object({
      login: loginSchema,
      config: this.generateReportSchema
    });
    setupType.parse(this.setup);
    return this.setup as z.infer<typeof setupType>;
  }
}
