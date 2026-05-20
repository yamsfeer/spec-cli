#!/usr/bin/env node

// ============================================================
// Spec CLI — 主入口
// ============================================================

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { generateCommand } from './commands/generate.js';
import { validateCommand } from './commands/validate.js';
import { statusCommand } from './commands/status.js';
import { configCommand } from './commands/config.js';
import { graphCommand } from './commands/graph.js';
import { updateCommand } from './commands/update.js';
import { exportCommand } from './commands/export.js';
import { output } from './utils/output.js';

const program = new Command();

program
  .name('spec-cli')
  .description('规范驱动开发 (SDD) 命令行工具')
  .version('0.1.0')
  .option('-s, --spec-dir <path>', 'Spec 目录路径', './specs')
  .option('-v, --verbose', '输出详细信息', false)
  .option('--json', '以 JSON 格式输出', false);

// 注册子命令
program.addCommand(initCommand);
program.addCommand(generateCommand);
program.addCommand(validateCommand);
program.addCommand(statusCommand);
program.addCommand(configCommand);
program.addCommand(graphCommand);
program.addCommand(updateCommand);
program.addCommand(exportCommand);

// 处理未知命令
program.on('command:*', () => {
  output.error(`未知命令: ${program.args.join(' ')}`);
  output.info('使用 spec-cli --help 查看可用命令');
  process.exit(1);
});

program.parse(process.argv);
