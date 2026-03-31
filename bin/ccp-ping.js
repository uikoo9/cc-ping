import { spawn } from 'node:child_process';
import { program } from 'commander';
import chalk from 'chalk';
import { getDB } from './util.js';

const db = getDB();

function pingOne(name, config, timeoutMs) {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn('claude', ['--print', '-p', 'hi', '--output-format', 'text'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ANTHROPIC_AUTH_TOKEN: config.Token,
        ANTHROPIC_BASE_URL: config.BaseURL,
      },
    });

    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        child.kill();
        resolve({ name, baseURL: config.BaseURL, status: 'timeout', elapsed: timeoutMs });
      }
    }, timeoutMs);

    child.on('close', (code) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      const elapsed = Date.now() - start;
      if (code === 0) {
        resolve({ name, baseURL: config.BaseURL, status: 'ok', elapsed });
      } else {
        resolve({ name, baseURL: config.BaseURL, status: 'error', elapsed, code });
      }
    });

    child.on('error', (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({ name, baseURL: config.BaseURL, status: 'error', elapsed: Date.now() - start, err });
    });
  });
}

const ping = async (options) => {
  try {
    const all = await db.all();
    const names = Object.keys(all).filter((k) => k !== 'default');

    if (names.length === 0) {
      console.error(chalk.red('No configs found. Run "ccp add" first.'));
      process.exit(1);
    }

    const timeoutMs = (options.timeout || 20) * 1000;
    console.log(chalk.blue(`Pinging ${names.length} config(s) in parallel (timeout: ${options.timeout || 20}s)...\n`));

    const results = await Promise.all(names.map((name) => pingOne(name, all[name], timeoutMs)));

    // sort by elapsed time
    results.sort((a, b) => a.elapsed - b.elapsed);

    for (const r of results) {
      const time = (r.elapsed / 1000).toFixed(1) + 's';
      const url = chalk.gray(`(${r.baseURL})`);
      if (r.status === 'ok') {
        console.log(`  ${chalk.green('✓')} ${chalk.bold(r.name)} ${url} ${chalk.green(time)}`);
      } else if (r.status === 'timeout') {
        console.log(`  ${chalk.yellow('✗')} ${chalk.bold(r.name)} ${url} ${chalk.yellow('timeout')}`);
      } else {
        console.log(`  ${chalk.red('✗')} ${chalk.bold(r.name)} ${url} ${chalk.red(`error ${time}`)}`);
      }
    }
  } catch (e) {
    console.error(chalk.red('Failed to ping.'));
    console.error(e);
    process.exit(1);
  }
};

program
  .command('ping')
  .description('test all configs connectivity and response time in parallel')
  .option('-t, --timeout <seconds>', 'timeout per config in seconds', '20')
  .action(ping);
