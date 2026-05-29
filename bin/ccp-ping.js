import Anthropic from '@anthropic-ai/sdk';
import { connect } from 'node:net';
import { program } from 'commander';
import chalk from 'chalk';
import { getDB } from './util.js';

const db = getDB();
const TCP_PING_TIMEOUT = 3000;

function tcpPing(baseURL) {
  return new Promise((resolve) => {
    try {
      const u = new URL(baseURL);
      const host = u.hostname;
      const port = Number(u.port) || (u.protocol === 'https:' ? 443 : 80);
      const sock = connect({ host, port, timeout: TCP_PING_TIMEOUT }, () => {
        sock.destroy();
        resolve(true);
      });
      sock.on('error', () => {
        sock.destroy();
        resolve(false);
      });
      sock.on('timeout', () => {
        sock.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

async function pingOne(name, config, timeoutMs, model) {
  // quick TCP check first
  const reachable = await tcpPing(config.BaseURL);
  if (!reachable) {
    return { name, baseURL: config.BaseURL, status: 'unreachable' };
  }

  const client = new Anthropic({
    apiKey: config.Token,
    baseURL: config.BaseURL,
    timeout: timeoutMs,
    maxRetries: 0,
    // Some relay providers block the SDK's default "Anthropic/JS" User-Agent at
    // their WAF. Mimic the Claude CLI's User-Agent so ping behaves like the real client.
    defaultHeaders: { 'user-agent': 'claude-cli (external, cli)' },
  });

  const start = Date.now();
  try {
    await client.messages.create({
      model,
      max_tokens: 64,
      messages: [{ role: 'user', content: 'Reply with exactly this word and nothing else: pong' }],
    });
    return { name, baseURL: config.BaseURL, status: 'ok', elapsed: Date.now() - start };
  } catch (err) {
    const elapsed = Date.now() - start;
    if (err.name === 'APIConnectionTimeoutError' || err.status === 408) {
      return { name, baseURL: config.BaseURL, status: 'timeout', elapsed: timeoutMs };
    }
    const msg = err.message ? err.message.split('\n')[0] : String(err);
    return { name, baseURL: config.BaseURL, status: 'error', elapsed, stderr: msg };
  }
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
    const model = options.model || 'claude-sonnet-4-6';
    console.log(
      chalk.blue(
        `Pinging ${names.length} config(s) in parallel (timeout: ${options.timeout || 20}s, model: ${model})...\n`,
      ),
    );

    function printResult(r) {
      const time = r.elapsed ? (r.elapsed / 1000).toFixed(1) + 's' : '-';
      const url = chalk.gray(`(${r.baseURL})`);
      if (r.status === 'ok') {
        console.log(`  ${chalk.green('✓')} ${chalk.bold(r.name)} ${url} ${chalk.green(time)}`);
      } else if (r.status === 'unreachable') {
        console.log(`  ${chalk.red('✗')} ${chalk.bold(r.name)} ${url} ${chalk.red('unreachable')}`);
      } else if (r.status === 'timeout') {
        console.log(`  ${chalk.yellow('✗')} ${chalk.bold(r.name)} ${url} ${chalk.yellow('timeout')}`);
      } else {
        const detail = r.stderr ? r.stderr.trim().split('\n')[0] : '';
        console.log(
          `  ${chalk.red('✗')} ${chalk.bold(r.name)} ${url} ${chalk.red(`error ${time}`)} ${chalk.gray(detail)}`,
        );
      }
    }

    await Promise.all(names.map((name) => pingOne(name, all[name], timeoutMs, model).then(printResult)));
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
  .option('-m, --model <name>', 'model name to use for the test request', 'claude-sonnet-4-6')
  .action(ping);
