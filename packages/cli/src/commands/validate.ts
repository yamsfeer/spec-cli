// ============================================================
// Spec CLI — validate 命令
// ============================================================

import { Command } from 'commander';
import path from 'path';
import { output } from '../utils/output.js';
import { SpecProject, Validator, IdRegistry } from '@spec-cli/core';
import type { ValidationResult, ValidationReport } from '@spec-cli/shared';

export const validateCommand = new Command('validate')
  .description('校验 Spec 规范性和一致性')
  .option('--strict', '将 Warning 也视为 Error')
  .option('--file <path>', '只检查指定文件')
  .option('--fix', '自动修复可修复的问题')
  .option('--json', '以 JSON 格式输出检查结果')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent?.opts() || {};
    const specDir = path.resolve(globalOpts.specDir || './specs');

    output.title('Spec Validation');
    output.divider();

    try {
      const project = new SpecProject(specDir);
      const index = await project.scanEntries();
      const registry = new IdRegistry(index);
      const validator = new Validator(registry, specDir);

      const report = await validator.validateAll({
        strict: options.strict || false,
      });

      if (options.json) {
        output.json(report);
        return;
      }

      // 按严重程度分组输出
      printErrors(report.errors);
      printWarnings(report.warnings);

      // 汇总
      output.blank();
      output.divider();
      output.kv('Completion', `${Math.round(report.completion)}% (files filled)`);
      output.kv('Ref health', `${Math.round(report.ref_health)}% (no dangling refs)`);

      // 退出码
      if (!report.passed) {
        if (options.strict) {
          output.blank();
          output.error('Validation failed (strict mode)');
          process.exit(1);
        } else {
          output.blank();
          output.warn('Validation passed with warnings');
        }
      } else {
        output.blank();
        output.ok('Validation passed');
      }

    } catch (err) {
      output.error(`校验失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

function printErrors(errors: ValidationResult[]): void {
  if (errors.length === 0) return;
  output.blank();
  output.error(`${errors.length} error(s) found:`);
  for (const e of errors) {
    console.log(`  - ${e.file}: ${e.message}`);
    if (e.fix) {
      console.log(`    Fix: ${e.fix}`);
    }
  }
}

function printWarnings(warnings: ValidationResult[]): void {
  if (warnings.length === 0) return;
  output.blank();
  output.warn(`${warnings.length} warning(s):`);
  for (const w of warnings) {
    console.log(`  - ${w.file}: ${w.message}`);
    if (w.fix) {
      console.log(`    Hint: ${w.fix}`);
    }
  }
}
