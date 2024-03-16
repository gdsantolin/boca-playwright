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

import { z } from "zod";
import { SetupModel } from "./setup";

export class Validate {

  private loginSystemSchema = z.object({
    logins: z.object({
      system: z.object({
        username: z.string(),
        password: z.string(),
      }),
    }),
  })

  private createContestSchema = z.object({
    contests: z.array(z.object({
      setup: z.object({
        name: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        stopAnswering: z.number().optional(),
        stopScoreboard: z.number().optional(),
        penalty: z.number().optional(),
        maxFileSize: z.number().optional(),
        mainSiteUrl: z.string().optional(),
        mainSiteNumber: z.number(),
        localSiteNumber: z.number().optional(),
        active: z.boolean(),
      })
    })),
  });

  private updateContestSchema = this.createContestSchema
    .extend({
      contests: z.array(z.object({
        setup: z.object({
          id: z.number(),
        })
      })),
    });

  private clearContestSchema = z.object({
    contests: z.array(z.object({
      setup: z.object({
        id : z.number(),
      })
    })),
  });
  private createUsersSchema = z.object({
    user: z.object({
      userSiteNumber: z.number().optional(),
      userNumber: z.string(),
      userName: z.string(),
      userType: z.union([
        z.literal("Team"),
        z.literal("Judge"),
        z.literal("Admin"),
        z.literal("Staff"),
        z.literal("Score"),
        z.literal("Site")
      ]),
      userFullName: z.string(),
      userDesc: z.string(),
    }),
  });
  private loginAdminSchema = z.object({
    logins: z.object({
      admin: z.object({
        username: z.string(),
        password: z.string(),
      }),
    }),
  });
  private insertUsersSchema = z.object({
    setup: z.object({
      userPath: z.string(),
    })
  });
  private deleteUserSchema = z.object({
    user: z.object({
      userName: z.string(),
    }),
  });

  constructor(public setup: SetupModel) {}

  loginSystem() {
    this.loginSystemSchema.parse(this.setup);
  }

  loginAdmin() {
    this.loginAdminSchema.parse(this.setup);
  }

  createContest() {
    this.createContestSchema.parse(this.setup);
  }

  updateContest() {
    this.updateContestSchema.parse(this.setup);
  }

  clearContest() {
    this.clearContestSchema.parse(this.setup);
  }

  createUser() {
    this.createUsersSchema.parse(this.setup);
  }

  insertUsers() {
    this.insertUsersSchema.parse(this.setup);
  }

  deleteUser() {
    this.deleteUserSchema.parse(this.setup);
  }
}
