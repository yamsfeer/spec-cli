// ============================================================
// Spec CLI — status 命令
// ============================================================

import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { output } from '../utils/output.js';
import { SpecProject, IdRegistry } from '@spec-cli/core';
import { SPEC_CATEGORIES, SPEC_DIR_STRUCTURE } from '@spec-cli/shared';
import type { CategoryStatus, StatusReport } from '@spec-cli/shared';

export const statusCommand = new Command('status')
  .description('查看 Spec 整体状态')
  .option('--json', '以 JSON 格式输出')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent?.opts() || {};
    const specDir = path.resolve(globalOpts.specDir || './specs');

    try {
      const report = await buildStatusReport(specDir);

      if (options.json) {
        output.json(report);
        return;
      }

      // 渲染状态报告
      output.title(`Spec Status: ${report.project_name}`);
      output.divider();
      output.kv('Version', report.version);
      output.kv('Last modified', report.last_modified);
      output.blank();

      output.title('Category Completion:');
      for (const cat of report.categories) {
        output.progress(cat.name, cat.percentage);
      }
      output.blank();

      output.divider();
      output.kv('Ref health', `${Math.round(report.ref_health)}%`);
      if (report.dangling_refs > 0) {
        output.warn(`${report.dangling_refs} dangling reference(s)`);
      }
      if (report.pending_changes > 0) {
        output.warn(`Pending changes: ${report.pending_changes}`);
      }

    } catch (err) {
      output.error(`获取状态失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

async function buildStatusReport(specDir: string): Promise<StatusReport> {
  const project = new SpecProject(specDir);
  const index = await project.scanEntries();
  const registry = new IdRegistry(index);

  // 计算各分类 заполненность
  const categories: CategoryStatus[] = [];
  let totalFiles = 0;
  let filledFiles = 0;

  for (const cat of SPEC_CATEGORIES) {
    const struct = SPEC_DIR_STRUCTURE[cat];
    const catDir = path.join(specDir, cat);
    let filled = 0;
    const total = struct.files.length;

    for (const file of struct.files) {
      const filePath = path.join(catDir, file);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        // 简单判断：文件内容超过最小模板大小就算已填充
        if (content.length > 100) {
          filled++;
        }
      }
    }

    totalFiles += total;
    filledFiles += filled;
    categories.push({
      name: cat,
      total,
      filled,
      percentage: total > 0 ? (filled / total) * 100 : 0,
    });
  }

  // 引用健康度
  const entries = registry.getAllEntries();
  const orphans = registry.findOrphans();
  const dangling = registry.findDanglingRefs();

  const totalEntries = entries.length;
  const refHealth = totalEntries > 0
    ? ((totalEntries - dangling.length) / totalEntries) * 100
    : 100;

  // 获取项目名和版本
  let projectName = '';
  let version = '0.1.0';
  try {
    const briefPath = path.join(specDir, '0_Project_Overview', 'project_brief.md');
    if (await fs.pathExists(briefPath)) {
      const content = await fs.readFile(briefPath, 'utf-8');
      const match = content.match(/# (.+) —/);
      if (match) projectName = match[1];
    }
  } catch {
    // ignore
  }

  // 最后修改时间
  let lastModified = 'N/A';
  try {
    const stat = await fs.stat(specDir);
    lastModified = stat.mtime.toISOString().replace('T', ' ').slice(0, 16);
  } catch {
    // ignore
  }

  return {
    project_name: projectName || index.project || 'Unknown',
    version,
    last_modified: lastModified,
    total_files: totalFiles,
    filled_files: filledFiles,
    categories,
    ref_health: refHealth,
    dangling_refs: dangling.length,
    pending_changes: 0, // TODO: 从 DiffTracker 获取
  };
}
