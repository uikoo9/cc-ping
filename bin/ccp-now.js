import { program } from 'commander';
import chalk from 'chalk';
import { getDB } from './util.js';

const db = getDB();

const now = async () => {
  try {
    const defaultConfigName = await db.config('default');
    if (!defaultConfigName) {
      console.log(chalk.gray('No config is currently in use.'));
      return;
    }

    console.log(chalk.blue(`${defaultConfigName} is now in use`));
  } catch (e) {
    console.error(chalk.red('Failed to get current config.'));
    console.error(e);
    process.exit(1);
  }
};

program.command('now').description('show current config in use').action(now);
