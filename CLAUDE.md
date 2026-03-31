# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

cc-switch (`ccs`) is a CLI tool for managing and switching between multiple Claude Code configurations. It stores configs in `~/ccs.json` and writes the active token/baseURL to `~/.claude/settings.json`.

## Mandatory Rules

- Language:
  - This is an English project. All copy, comments, and UI text in code must be in English.
- Proposals:
  - Any technical decision must be backed by a reliable data source (e.g. official documentation).
  - If no reliable source is available, ask the user. It is acceptable to say "I don't know."
- Code Changes:
  - Before modifying code, list the intended changes and get confirmation first.
- Commits:
  - Before committing, pull the latest code first.
  - Then run `npm run lint` and only proceed if it passes with no errors.
  - Write the commit message based on the diff summary.
  - Only then commit.
- Push:
  - Before pushing, confirm with the user whether to push.
  - Only push after confirmation.

## Repository Structure

Flat ESM project (no monorepo). All source lives in `bin/`.

- **Entry point**: `bin/ccs.js` — registers all subcommands via `commander`, parses CLI args
- **Commands**: `ccs-add.js`, `ccs-use.js`, `ccs-list.js`, `ccs-now.js`, `ccs-remove.js`, `ccs-ping.js`
- **Config storage**: `bin/config-store.js` — JSON file store using `node:fs/promises`; `bin/util.js` creates the store at `~/ccs.json`

## Key Dependencies

- `commander` — CLI framework
- `chalk` — terminal colors
- `@inquirer/prompts` — interactive prompts (used in `ccs add`)
- `node:fs/promises` — file I/O (built-in, no external dependency)

## Commands

```shell
npm install          # install dependencies
npm run lint         # eslint + prettier check
npm run format       # prettier format all files
```

## Git Hooks & Commit Conventions

- **pre-commit**: runs `lint-staged` which triggers `eslint --fix` + `prettier --write` on staged `.js`/`.json`/`.md` files
- **commit-msg**: enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint (`@commitlint/config-conventional`)
