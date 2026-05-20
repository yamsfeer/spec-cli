// ============================================================
// Spec CLI — config 命令
// ============================================================

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { output } from '../utils/output.js';
import { SpecCliConfigSchema, DEFAULT_CONFIG } from '@spec-cli/shared';
import type { SpecCliConfig } from '@spec-cli/shared';

const configCommand = new Command('config')
  .description('管理 spec-cli 配置');

configCommand
  .command('set')
  .description('设置配置项')
  .argument('<key>', '配置键 (如 ai.model, agents.pm.language)')
  .argument('<value>', '配置值')
  .option('--global', '设置全局配置（~/.spec-cli.json）')
  .action(async (key, value, options) => {
    try {
      const config = await loadConfig(options.global);
      setNestedValue(config, key, parseValue(value));
      await saveConfig(config, options.global);
      output.ok(`配置已更新: ${key} = ${value}`);
    } catch (err) {
      output.error(`配置失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

configCommand
  .command('get')
  .description('查看配置项')
  .argument('<key>', '配置键')
  .option('--global', '使用全局配置')
  .action(async (key, options) => {
    try {
      const config = await loadConfig(options.global);
      const value = getNestedValue(config, key);
      output.kv(key, String(value ?? '(not set)'));
    } catch (err) {
      output.error(`读取配置失败: ${(err as Error).message}`);
    }
  });

configCommand
  .command('list')
  .description('列出所有配置')
  .option('--global', '使用全局配置')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.global);
      output.title('Current Configuration:');
      output.divider();
      printConfig(config, '');
    } catch (err) {
      output.error(`读取配置失败: ${(err as Error).message}`);
    }
  });

export { configCommand };

// -------- 辅助函数 --------

function getConfigPath(global: boolean): string {
  if (global) {
    return path.join(os.homedir(), '.spec-cli.json');
  }
  return path.join(process.cwd(), '.spec-cli.json');
}

async function loadConfig(global: boolean): Promise<SpecCliConfig> {
  const configPath = getConfigPath(global);
  if (await fs.pathExists(configPath)) {
    const raw = await fs.readJson(configPath);
    return { ...DEFAULT_CONFIG, ...raw };
  }
  return { ...DEFAULT_CONFIG };
}

async function saveConfig(config: SpecCliConfig, global: boolean): Promise<void> {
  const configPath = getConfigPath(global);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

function parseValue(value: string): unknown {
  // 尝试解析为 JSON
  try {
    return JSON.parse(value);
  } catch {
    // 解析为布尔
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }
}

function setNestedValue(obj: Record<string, unknown>, key: string, value: unknown): void {
  const parts = key.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function printConfig(obj: Record<string, unknown>, prefix: string): void {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      printConfig(value as Record<string, unknown>, fullKey);
    } else {
      output.kv(fullKey, JSON.stringify(value));
    }
  }
}
