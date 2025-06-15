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

export type Run = z.infer<typeof runSchema>;

export type RunType = z.infer<typeof runType>;

export type RunTypeTeam = z.infer<typeof runTypeTeam>;

export type GetRun = z.infer<typeof getRunSchema>;

export type SubmitRun = z.infer<typeof submitRunSchema>;

export const runSchema = z.object({
  runPath: z.string()
});

export const getRunSchema = z.object({
  id: z.string()
});

export const submitRunSchema = z.object({
  problem: z.string(),
  language: z.string(),
  filePath: z.string()
});

export const runType = z.object({
  id: z.string(),
  site: z.string(),
  user: z.string(),
  time: z.string(),
  problem: z.string(),
  language: z.string(),
  status: z.string(),
  answer: z.string()
});

export const runTypeTeam = runType
  .pick({
    id: true,
    time: true,
    problem: true,
    language: true,
    answer: true
  })
  .extend({
    file: z.string()
  });
