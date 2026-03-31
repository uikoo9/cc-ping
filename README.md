## cc-switch

[![npm version](https://img.shields.io/npm/v/cc-switch.svg?style=flat-square)](https://www.npmjs.org/package/cc-switch)
[![npm downloads](https://img.shields.io/npm/dm/cc-switch.svg?style=flat-square)](https://npm-stat.com/charts.html?package=cc-switch)

A lightweight CLI tool to manage and switch between multiple Claude Code configurations easily.

## Installation

```shell
# Install globally
npm i -g cc-switch
```

## Usage

```shell
# Show help
ccs
ccs -h

# Add a new config
ccs add

# List all configs
ccs list

# Show current config in use
ccs now

# Switch to a specific config
ccs use <configName>

# Remove a config
ccs remove <configName>

# Test all configs connectivity and response time (parallel)
ccs ping
ccs ping -t 10   # custom timeout (default: 20s)
```

## Example

```shell
# Add configs
$ ccs add
? Enter a name for this config: official
? Token (ANTHROPIC_AUTH_TOKEN): sk-ant-xxx
? Base URL (ANTHROPIC_BASE_URL): https://api.anthropic.com

$ ccs add
? Enter a name for this config: relay1
? Token (ANTHROPIC_AUTH_TOKEN): cr_xxx
? Base URL (ANTHROPIC_BASE_URL): http://relay1.example.com/api

$ ccs add
? Enter a name for this config: relay2
? Token (ANTHROPIC_AUTH_TOKEN): cr_xxx
? Base URL (ANTHROPIC_BASE_URL): http://relay2.example.com/api

# Switch to a config
$ ccs use official
Switched to "official"
  Token: sk-ant-x...
  BaseURL: https://api.anthropic.com

# Check current config
$ ccs now
official is now in use

# List all configs (* marks the active one)
$ ccs list
Configs:

* official (https://api.anthropic.com)
  relay1 (http://relay1.example.com/api)
  relay2 (http://relay2.example.com/api)

# Ping all configs in parallel
$ ccs ping
Pinging 3 config(s) in parallel (timeout: 20s)...

  ✓ official (https://api.anthropic.com) 8.3s
  ✓ relay1 (http://relay1.example.com/api) 10.7s
  ✓ relay2 (http://relay2.example.com/api) 12.0s
```

## How It Works

Configs are stored in `~/ccs.json`. When you run `ccs use <name>`, it updates **only** `env.ANTHROPIC_AUTH_TOKEN` and `env.ANTHROPIC_BASE_URL` in `~/.claude/settings.json`, leaving all other settings untouched.

## License

MIT
