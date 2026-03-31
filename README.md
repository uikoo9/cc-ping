## cc-ping

[![npm version](https://img.shields.io/npm/v/cc-ping.svg?style=flat-square)](https://www.npmjs.org/package/cc-ping)
[![npm downloads](https://img.shields.io/npm/dm/cc-ping.svg?style=flat-square)](https://npm-stat.com/charts.html?package=cc-ping)

A lightweight CLI tool to manage multiple Claude Code configurations and **ping them all in parallel** to compare response times.

## Highlights

- **Parallel Ping** — test all your Claude Code endpoints at once, ranked by response time
- **Configurable Timeout** — default 20s, adjustable via `--timeout`
- **Simple Config Management** — add / list / switch / remove configs in seconds

## Installation

```shell
npm i -g cc-ping
```

## Usage

```shell
# Show help
ccp -h

# Add a new config
ccp add

# List all configs
ccp list

# Show current config in use
ccp now

# Switch to a specific config
ccp use <configName>

# Remove a config
ccp remove <configName>

# Ping all configs in parallel (the highlight!)
ccp ping
ccp ping -t 10   # custom timeout (default: 20s)
```

## Example

```shell
# Add configs
$ ccp add
? Enter a name for this config: official
? Token (ANTHROPIC_AUTH_TOKEN): sk-ant-xxx
? Base URL (ANTHROPIC_BASE_URL): https://api.anthropic.com

$ ccp add
? Enter a name for this config: relay1
? Token (ANTHROPIC_AUTH_TOKEN): cr_xxx
? Base URL (ANTHROPIC_BASE_URL): http://relay1.example.com/api

$ ccp add
? Enter a name for this config: relay2
? Token (ANTHROPIC_AUTH_TOKEN): cr_xxx
? Base URL (ANTHROPIC_BASE_URL): http://relay2.example.com/api

# Switch to a config
$ ccp use official
Switched to "official"
  Token: sk-ant-x...
  BaseURL: https://api.anthropic.com

# Check current config
$ ccp now
official is now in use

# List all configs (* marks the active one)
$ ccp list
Configs:

* official (https://api.anthropic.com)
  relay1 (http://relay1.example.com/api)
  relay2 (http://relay2.example.com/api)

# Ping all configs in parallel
$ ccp ping
Pinging 3 config(s) in parallel (timeout: 20s)...

  ✓ official (https://api.anthropic.com) 8.3s
  ✓ relay1 (http://relay1.example.com/api) 10.7s
  ✓ relay2 (http://relay2.example.com/api) 12.0s
```

## How It Works

Configs are stored in `~/ccp.json`. When you run `ccp use <name>`, it updates **only** `env.ANTHROPIC_AUTH_TOKEN` and `env.ANTHROPIC_BASE_URL` in `~/.claude/settings.json`, leaving all other settings untouched.

## License

MIT
