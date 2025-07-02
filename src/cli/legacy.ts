import { program, Option } from 'commander';
import { Logger } from '../logger';
import { ZodError } from 'zod';
import { Setup, setupSchema } from '../data/setup';
import { ReadMessages, ExitErrors } from '../errors/read_errors';
import { Output } from '../output';
import { methods } from './methods';
import * as fs from 'fs';

let TIMEOUT = 5000;

export function legacyCLI(): number {
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
    .option(
      '-t, --timeout <timeout>',
      'timeout for each test, hook and/or fixture (in milliseconds)',
      TIMEOUT.toString()
    )
    .option('-v, --verbose', 'verbose mode')
    .parse();

  const { path, method, verbose, timeout } = program.opts();
  const logger = Logger.getInstance(verbose);
  const output = Output.getInstance();

  try {
    fs.accessSync(path);
  } catch {
    logger.logError(ReadMessages.CONFIG_NOT_FOUND);
    process.exit(ExitErrors.ARGS_VALIDATION);
  }

  const setup = JSON.parse(fs.readFileSync(path, 'utf8')) as Setup;

  try {
    setupSchema.parse(setup);
  } catch (e) {
    if (e instanceof ZodError) logger.logZodError(e);
    process.exit(ExitErrors.CONFIG_VALIDATION);
  }

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
    .catch((e) => {
      logger.logError(e);
      process.exit(ExitErrors.CONFIG_VALIDATION);
    });

  return ExitErrors.OK;
}
