#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { program } from 'commander';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));

program.version(pkg.version, '-v, --version').description('claude code ping').usage('<command>');

// cmds
import './ccp-add.js';
import './ccp-list.js';
import './ccp-now.js';
import './ccp-remove.js';
import './ccp-use.js';
import './ccp-ping.js';

// parse
program.parse(process.argv);
