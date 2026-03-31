#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { program } from 'commander';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));

program.version(pkg.version, '-v, --version').description('claude code switch').usage('<command>');

// cmds
import './ccs-add.js';
import './ccs-list.js';
import './ccs-now.js';
import './ccs-remove.js';
import './ccs-use.js';
import './ccs-ping.js';

// parse
program.parse(process.argv);
