import os from 'node:os';
import path from 'node:path';
import chalk from 'chalk';
import { createStore } from './config-store.js';

export function getDB() {
  const dbPath = path.resolve(os.homedir(), './ccp.json');
  return createStore(dbPath);
}

export function printConfigs(all, activeConfig) {
  const names = Object.keys(all).filter((k) => k !== 'default');
  if (names.length === 0) {
    console.log(chalk.gray('  No configs found.'));
    return;
  }
  for (const name of names) {
    const prefix = name === activeConfig ? chalk.green('* ') : '  ';
    const cfg = all[name];
    console.log(`${prefix}${chalk.bold(name)} ${chalk.gray(`(${cfg.BaseURL})`)}`);
  }
}
