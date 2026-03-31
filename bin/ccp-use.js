import os from 'node:os';
import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { program } from 'commander';
import chalk from 'chalk';
import { getDB } from './util.js';

const db = getDB();

async function readSettings(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

const use = async (configName) => {
  try {
    const dbValue = await db.config(configName);
    if (!dbValue) {
      console.error(chalk.red('Config not found.'));
      process.exit(1);
    }

    // default
    await db.config('default', configName);

    // read and merge settings
    const settingsDir = path.resolve(os.homedir(), '.claude');
    const settingsPath = path.resolve(settingsDir, 'settings.json');

    await mkdir(settingsDir, { recursive: true });
    const settings = await readSettings(settingsPath);
    settings.env = settings.env || {};
    settings.env.ANTHROPIC_AUTH_TOKEN = dbValue.Token;
    settings.env.ANTHROPIC_BASE_URL = dbValue.BaseURL;

    await writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    console.log(chalk.blue(`Switched to "${configName}"`));
    console.log(chalk.gray(`  Token: ${dbValue.Token.slice(0, 8)}...`));
    console.log(chalk.gray(`  BaseURL: ${dbValue.BaseURL}`));
  } catch (e) {
    console.error(chalk.red('Failed to switch config.'));
    console.error(e);
    process.exit(1);
  }
};

program.command('use <configName>').description('switch claude code config').action(use);
