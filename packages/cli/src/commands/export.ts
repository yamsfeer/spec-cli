// ============================================================
// Spec CLI — export 命令（基础版）
// ============================================================

import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { output } from '../utils/output.js';
import { SpecProject, IdRegistry } from '@spec-cli/core';
import type { ExportFormat } from '@spec-cli/shared';

export const exportCommand = new Command('export')
  .description('导出 Spec 为其他格式')
  .option('--format <type>', '导出格式 (ai-context, openapi, pdf, json)', 'ai-context')
  .option('--output <path>', '输出路径', './spec-export')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent?.opts() || {};
    const specDir = path.resolve(globalOpts.specDir || './specs');
    const format = options.format as ExportFormat;
    const outputPath = path.resolve(options.output || './spec-export');

    try {
      const project = new SpecProject(specDir);
      const index = await project.scanEntries();

      switch (format) {
        case 'ai-context':
          await exportAiContext(project, index, outputPath);
          break;
        case 'json':
          await exportJson(project, index, outputPath);
          break;
        case 'openapi':
          await exportOpenApi(project, index, outputPath);
          break;
        case 'pdf':
          output.info('PDF export is not yet implemented');
          break;
        default:
          output.error(`不支持的导出格式: ${format}`);
          process.exit(1);
      }

      output.ok(`导出完成: ${outputPath}`);
    } catch (err) {
      output.error(`导出失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

async function exportAiContext(
  project: SpecProject,
  index: unknown,
  outputPath: string
): Promise<void> {
  const files = await project.getAllFiles();
  const mdFiles = files.filter(f => f.endsWith('.md'));

  let context = '# Project Spec — AI Context\n\n';
  context += '> 以下内容为 Spec 文档的精简上下文，供 AI Agent 使用。\n\n';

  for (const file of mdFiles) {
    try {
      const content = await project.readFile(file);
      // 提取正文（去除 Front Matter）
      const bodyStart = content.indexOf('---\n', 4);
      const body = bodyStart > 0
        ? content.slice(bodyStart + 4).trim()
        : content;

      context += `## ${file}\n\n${body}\n\n`;
    } catch {
      // skip unreadable files
    }
  }

  const outFile = path.join(outputPath, 'ai-context.md');
  await fs.ensureDir(outputPath);
  await fs.writeFile(outFile, context, 'utf-8');
  output.kv('Format', 'ai-context');
  output.kv('File', outFile);
}

async function exportJson(
  project: SpecProject,
  index: unknown,
  outputPath: string
): Promise<void> {
  await fs.ensureDir(outputPath);
  const outFile = path.join(outputPath, 'spec.json');
  await fs.writeJson(outFile, index, { spaces: 2 });
  output.kv('Format', 'json');
  output.kv('File', outFile);
}

async function exportOpenApi(
  _project: SpecProject,
  _index: unknown,
  _outputPath: string
): Promise<void> {
  // TODO: 从 api_design/ 解析并导出 OpenAPI 3.0 规范
  output.info('OpenAPI export: 解析 api_design/ 端点定义...');
  output.info('Not yet fully implemented');
}
