import { program } from 'commander';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import { getDB, printConfigs } from './util.js';

const db = getDB();

const add = async () => {
  try {
    const Name = await input({
      message: 'Enter a name for this config:',
      validate: (v) => (v.trim() ? true : 'Name cannot be empty.'),
    });
    if (Name === 'default') {
      console.error(chalk.red('"default" is a reserved name. Please choose another.'));
      process.exit(1);
    }

    const Token = await input({
      message: 'Token (ANTHROPIC_AUTH_TOKEN):',
      validate: (v) => (v.trim() ? true : 'Token cannot be empty.'),
    });
    const BaseURL = await input({
      message: 'Base URL (ANTHROPIC_BASE_URL):',
      validate: (v) => (v.trim() ? true : 'Base URL cannot be empty.'),
    });
    console.log();

    // check
    const dbValue = await db.config(Name);
    if (dbValue) {
      console.error(chalk.red('Config name already exists.'));
      process.exit(1);
    }

    // set
    await db.config(Name, { Name, Token, BaseURL });
    console.log(chalk.blue('Config added successfully.'));
    console.log();

    // list
    const all = await db.all();
    printConfigs(all, all.default);
  } catch (e) {
    console.error(chalk.red('Failed to add config.'));
    console.error(e);
    process.exit(1);
  }
};

program.command('add').description('add claude code config').action(add);
