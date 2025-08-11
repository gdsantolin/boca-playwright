import inquirer from 'inquirer';
import figlet from 'figlet';
import { Logger } from '../logger';
import { ZodError } from 'zod';
import { Setup, setupSchema } from '../data/setup';
import { ExitErrors } from '../errors/read_errors';
import { Output } from '../output';
import { methods } from './methods';
import { ExitPromptError } from '@inquirer/core';
import {
  rolePermissions,
  categorizedMethods,
  teamMethods
} from './permissions';
import * as fs from 'fs';
import { getUserRoleFromLogin, Role } from '../scripts/auth';

type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

export async function interactiveCLI(defaultHost?: string): Promise<void> {
  const logger = Logger.getInstance(true);
  const output = Output.getInstance();

  let host = defaultHost;

  printHeader();

  const teamPrompts: Record<string, () => Promise<PartialDeep<Setup>>> = {
    submitRun: async () => ({
      run: await inquirer.prompt([
        { type: 'input', name: 'problem', message: 'Problem Name:' },
        { type: 'input', name: 'language', message: 'Language:' },
        { type: 'input', name: 'filePath', message: 'Path to source file:' }
      ])
    }),

    downloadTeamRun: async () => {
      const { id } = await inquirer.prompt([
        { type: 'input', name: 'id', message: 'Run ID:' }
      ]);
      const { runPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'runPath',
          message: 'Path to save run:',
          default: './runs'
        }
      ]);
      return {
        config: { runPath },
        run: { id }
      };
    },

    downloadTeamRuns: async () => {
      const { runPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'runPath',
          message: 'Path to save runs:',
          default: './runs'
        }
      ]);
      return { config: { runPath } };
    },

    getTeamRun: async () => ({
      run: await inquirer.prompt([
        { type: 'input', name: 'id', message: 'Run ID:' }
      ])
    }),

    getTeamRuns: async () => ({}),

    getTeamProblem: async () => ({
      problem: await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Problem name:' }
      ])
    }),

    getTeamProblems: async () => ({}),

    downloadTeamProblems: async () => {
      const { downloadDir } = await inquirer.prompt([
        {
          type: 'input',
          name: 'downloadDir',
          message: 'Path to save problems:',
          default: './problems'
        }
      ]);
      return {
        config: { runPath: downloadDir }
      };
    },

    downloadTeamProblem: async () => {
      const problem = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Problem name:' }
      ]);
      const { downloadDir } = await inquirer.prompt([
        {
          type: 'input',
          name: 'downloadDir',
          message: 'Path to save problem:',
          default: './problems'
        }
      ]);
      return {
        problem: {
          ...problem,
          downloadDir
        }
      };
    }
  };

  const cliRunning = true;
  while (cliRunning) {
    try {
      const { username, password } = await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: 'Enter your BOCA username:'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter your password:'
        }
      ]);

      let role: Role;
      try {
        const loginResult = await getUserRoleFromLogin(username, password);
        role = loginResult.role;
        logger.logInfo(`User role detected: ${role}`);
      } catch (e: unknown) {
        if (e instanceof Error) {
          logger.logError(e.message);
          continue; // Retry authentication
        }
        throw e;
      }

      const allowedCategories =
        rolePermissions[role as keyof typeof rolePermissions];

      let inCategoryMenu = true;
      while (inCategoryMenu) {
        const { category: selectedCategory } = await inquirer.prompt([
          {
            type: 'list',
            name: 'category',
            message: 'Select a category:',
            choices: ['<< Exit', '< Change User', ...allowedCategories],
            loop: false
          }
        ]);

        if (selectedCategory === '<< Exit') {
          console.log('\nGoodbye!');
          process.exit(0);
        }

        if (selectedCategory === '< Change User') {
          inCategoryMenu = false;
          break;
        }

        const category = selectedCategory;

        let methodNames = [
          ...categorizedMethods[category as keyof typeof categorizedMethods]
        ];

        if (role === 'Admin') {
          methodNames = methodNames.filter((key) => !teamMethods.includes(key));
        }

        if (role === 'Team') {
          methodNames = methodNames.filter((key) => teamMethods.includes(key));
        }

        if (methodNames.length === 0) {
          logger.logError(
            'No methods available for this role and category combination.'
          );
          continue;
        }

        let inMethodMenu = true;
        while (inMethodMenu) {
          const { method } = await inquirer.prompt([
            {
              type: 'list',
              name: 'method',
              message: `Choose a method in "${category}":`,
              choices: ['<< Back to categories', ...methodNames],
              loop: false
            }
          ]);

          if (method === '<< Back to categories') {
            inMethodMenu = false;
            break;
          }

          const selectedMethod = methods[method];
          if (!selectedMethod) {
            logger.logError(`Method "${method}" not found.`);
            continue;
          }

          // Team methods use prompts instead of resource files
          if (role === 'Team') {
            if (!host) {
              const { inputHost } = await inquirer.prompt([
                {
                  type: 'input',
                  name: 'inputHost',
                  message: 'Enter the BOCA host URL:',
                  default: 'localhost:8000/boca'
                }
              ]);
              host = inputHost;
            }

            let methodData: PartialDeep<Setup> = {};
            const promptFn = teamPrompts[method];
            if (promptFn) {
              methodData = await promptFn();
            }

            const setup: Setup = {
              config: {
                url: host!,
                resultFilePath: './resources/result.json',
                ...(methodData.config || {})
              },
              login: { username, password },
              ...(methodData.run ? { run: methodData.run } : {}),
              ...(methodData.problem ? { problem: methodData.problem } : {})
            };

            try {
              await selectedMethod(setup);
              logger.logInfo('Executed successfully.');

              if (setup.config.resultFilePath) {
                output.writeFile(setup.config.resultFilePath);
                logger.logInfo(
                  'Result saved at %s',
                  setup.config.resultFilePath
                );
              }
            } catch (e) {
              if (e instanceof ZodError) {
                logger.logZodError(e);
              } else {
                logger.logError(String(e));
              }
            }

            continue; // volta pro menu de métodos
          }

          // Admin and System methods still use resource files
          const { filePath } = await inquirer.prompt([
            {
              type: 'input',
              name: 'filePath',
              message:
                'Enter the config file path (JSON) or type "back" to return:',
              validate: (input) => {
                if (input.trim() === 'back') return true;
                return fs.existsSync(input) ? true : 'File not found.';
              }
            }
          ]);

          if (filePath.trim() === 'back') {
            continue;
          }

          try {
            const setup = JSON.parse(
              fs.readFileSync(filePath, 'utf8')
            ) as Setup;
            setupSchema.parse(setup);

            await selectedMethod(setup);
            logger.logInfo('Executed successfully.');

            if (output.isActive && setup.config.resultFilePath) {
              output.writeFile(setup.config.resultFilePath);
              logger.logInfo('Result saved at %s', setup.config.resultFilePath);
            }
          } catch (e) {
            if (e instanceof ZodError) {
              logger.logZodError(e);
            } else {
              logger.logError(String(e));
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof ExitPromptError) {
        console.log('\nGoodbye!');
        process.exit(0);
      }

      if (e instanceof ZodError) {
        logger.logZodError(e);
      } else {
        logger.logError(String(e));
      }

      process.exit(ExitErrors.CONFIG_VALIDATION);
    }
  }
}

export function printHeader(): void {
  console.clear();

  const ascii = figlet.textSync('BOCA CLI', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  console.log(ascii);
}
