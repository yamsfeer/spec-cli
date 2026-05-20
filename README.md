# Spec CLI

> 以规范驱动开发（Spec-Driven Development, SDD）为核心的命令行工具

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org)

**Spec CLI** helps developers create, manage, validate, and visualize project specifications (specs). It leverages AI agents to generate high-quality PRDs, architecture designs, and other core documents — all following a standardized, machine-checkable format.

---

## Features

- **Standardized Spec System** — 8-category directory structure, ID-based cross-referencing, fully verifiable
- **AI-Powered Agents** — PM Agent for structured PRD interviews, Architect Agent for architecture inference
- **Built-in Validation** — Automatic checks for completeness, consistency, reference health, and document integrity
- **Reference Graph** — Query dependencies, trace impact radius, find dead references
- **Versioned Changes** — Change tracking with full rollback support
- **Export Ready** — Export specs for AI context, OpenAPI specs, and more

---

## Quick Start

```bash
# Install (requires Node.js >= 18)
npm install -g spec-cli

# Initialize a new spec project
spec-cli init

# Generate PRD with AI-powered interview
spec-cli generate --batch prd

# Validate spec health
spec-cli validate

# View overall status
spec-cli status
```

---

## Command Overview

| Command | Description |
|---------|-------------|
| `spec-cli init` | Initialize a new spec project |
| `spec-cli generate` | Generate/fill spec documents with AI |
| `spec-cli validate` | Check spec integrity and consistency |
| `spec-cli status` | View overall spec health |
| `spec-cli config` | Manage spec-cli settings |
| `spec-cli graph` | Query reference relationships |
| `spec-cli update` | Manage change lifecycle |
| `spec-cli export` | Export specs to other formats |

---

## Spec Categories

```
specs/
├── 0_Project_Overview/     # Project brief, glossary, constitution
├── 1_PRD/                  # Product requirements, user stories, functional specs
├── 2_Architecture/         # Tech stack, system architecture, API design
├── 3_Data_Model/           # ER diagram, entities, schema, data dictionary
├── 4_UI_UX/                # Design tokens, components, user flows, state machines
├── 5_Dev_Standards/        # Coding style, naming conventions, git workflow
├── 6_AI_Context/           # Prompt templates, AI rules, file index
└── 7_Changelog/            # Change log, ADRs
```

---

## Configuration

Configure via `.spec-cli.json` in your project root or `~/.spec-cli.json` globally:

```json
{
  "project": { "name": "MyApp", "spec_dir": "./specs" },
  "ai": { "provider": "openai", "model": "gpt-4o" },
  "validate": { "strict": false, "auto_fix": false }
}
```

---

## Development

This is a pnpm monorepo:

```bash
pnpm install
pnpm build
node packages/cli/dist/index.js init --bare --output /tmp/my-project
```

### Packages

| Package | Path | Description |
|---------|------|-------------|
| `@spec-cli/shared` | `packages/shared/` | Shared types, constants, Zod schemas |
| `@spec-cli/core` | `packages/core/` | Core engine (spec management, validation, graph) |
| `@spec-cli/agents` | `packages/agents/` | PM Agent & Architect Agent |
| `spec-cli` | `packages/cli/` | CLI entry point and command implementations |

---

## Requirements

- Node.js >= 18
- pnpm >= 8

---

## License

MIT
