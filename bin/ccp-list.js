import { program } from 'commander';
import chalk from 'chalk';
import { getDB, printConfigs } from './util.js';

const db = getDB();

const list = async () => {
  try {
    const all = await db.all();
    console.log(chalk.blue('Configs:'));
    console.log();
    printConfigs(all, all.default);
  } catch (e) {
    console.error(chalk.red('Failed to list configs.'));
    console.error(e);
    process.exit(1);
  }
};

program.command('list').description('list claude code configs').action(list);
