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
  adminDeniedMethods,
  teamAllowedMethods
} from './permissions';
import * as fs from 'fs';
import { getUserRoleFromLogin } from '../scripts/auth';

export async function interactiveCLI(): Promise<void> {
  const logger = Logger.getInstance(true);
  const output = Output.getInstance();

  printHeader();

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

      const { role } = await getUserRoleFromLogin(username, password);
      logger.logInfo(`User role detected: ${role}`);

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
          methodNames = methodNames.filter(
            (key) => !adminDeniedMethods.includes(key)
          );
        }

        if (role === 'Team') {
          methodNames = methodNames.filter((key) =>
            teamAllowedMethods.includes(key)
          );
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

          if (filePath.trim() === '<< back') {
            continue;
          }

          try {
            const setup = JSON.parse(
              fs.readFileSync(filePath, 'utf8')
            ) as Setup;
            setupSchema.parse(setup);

            const selectedMethod = methods[method];
            if (!selectedMethod) {
              logger.logError(`Method "${method}" not found.`);
              continue;
            }

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
