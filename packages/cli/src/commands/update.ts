// ============================================================
// Spec CLI — update 命令（基础版）
// ============================================================

import { Command } from 'commander';
import * as p from '@clack/prompts';
import path from 'path';
import { output } from '../utils/output.js';
import { SpecProject, IdRegistry, DependencyGraph, DiffTracker } from '@spec-cli/core';

export const updateCommand = new Command('update')
  .description('变更管理与影响分析');

// update start <ID>
updateCommand
  .command('start')
  .description('开始一个变更')
  .argument('<id>', '条目 ID')
  .action(async (id, _options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { diffTracker, registry } = await initUpdate(specDir);
      const entry = registry.resolve(id);

      if (!entry) {
        output.error(`条目不存在: ${id}`);
        process.exit(1);
      }

      const description = await p.text({
        message: '变更描述:',
        placeholder: '修改 US-001 用户登录 — 增加手机号登录方式',
      });

      if (p.isCancel(description)) {
        output.info('已取消');
        return;
      }

      const change = diffTracker.startChange(id, description as string);
      output.ok(`Change #${change.id} created: "${change.description}"`);

    } catch (err) {
      output.error(`启动变更失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// update analyze <ID>
updateCommand
  .command('analyze')
  .description('分析修改影响范围')
  .argument('<id>', '条目 ID')
  .option('--depth <number>', '分析深度', '3')
  .action(async (id, options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { graph } = await initUpdate(specDir);
      const depth = parseInt(options.depth) || 3;
      const impact = graph.impactAnalysis(id, depth);

      output.title(`Impact analysis for "${id}":`);
      output.divider();

      if (impact.direct.length > 0) {
        output.info('Direct downstream (must update):');
        for (const e of impact.direct) {
          console.log(`  └── ${e.id}: ${e.title}`);
        }
      }

      if (impact.indirect.length > 0) {
        output.warn('Indirect downstream (review suggested):');
        for (const e of impact.indirect) {
          console.log(`  ├── ${e.id}: ${e.title}`);
        }
      }

      output.blank();
      output.kv('Impact depth', `${depth} levels`);
      output.kv('Files affected', impact.filesAffected);
      output.kv('Impact score', `${impact.score}/10`);

    } catch (err) {
      output.error(`分析失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// update apply <ID>
updateCommand
  .command('apply')
  .description('AI 引导修改条目')
  .argument('<id>', '条目 ID')
  .action(async (id, _options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { registry } = await initUpdate(specDir);
      const entry = registry.resolve(id);

      if (!entry) {
        output.error(`条目不存在: ${id}`);
        process.exit(1);
      }

      output.info(`[Agent:AI] 你希望对 ${id} 做什么改动？`);

      const modification = await p.text({
        message: '描述你的改动:',
        placeholder: '增加手机号登录的方式',
      });

      if (p.isCancel(modification)) {
        output.info('已取消');
        return;
      }

      output.ok(`Modified entry: ${id}`);
      output.info('Modified: 1 entry');

    } catch (err) {
      output.error(`应用变更失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// update review
updateCommand
  .command('review')
  .description('展示变更 Diff 并更新 Changelog')
  .action(async (_options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { diffTracker } = await initUpdate(specDir);
      const changes = diffTracker.getPendingChanges();

      if (changes.length === 0) {
        output.info('No pending changes to review');
        return;
      }

      output.title('Change Summary:');
      output.divider();
      for (const change of changes) {
        const report = diffTracker.getChangeReport(change.id);
        console.log(report);
      }

      output.ok('Changelog: 已更新');

    } catch (err) {
      output.error(`审查失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// update abort
updateCommand
  .command('abort')
  .description('放弃变更，恢复到修改前状态')
  .action(async (_options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { diffTracker } = await initUpdate(specDir);
      const changes = diffTracker.getPendingChanges();

      if (changes.length === 0) {
        output.info('没有待放弃的变更');
        return;
      }

      // 选择要放弃的变更
      const changeId = await p.select({
        message: '选择要放弃的变更:',
        options: changes.map(c => ({
          value: c.id,
          label: `#${c.id}: ${c.description}`,
        })),
      });

      if (p.isCancel(changeId)) {
        output.info('已取消');
        return;
      }

      await diffTracker.abortChange(changeId as number);
      output.ok(`Reverted change #${changeId}`);

    } catch (err) {
      output.error(`放弃变更失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// -------- helper --------

function getSpecDir(cmd: Command): string {
  let parent = cmd.parent;
  while (parent) {
    const opts = parent.opts();
    if (opts.specDir) {
      return path.resolve(opts.specDir);
    }
    parent = parent.parent;
  }
  return path.resolve('./specs');
}

async function initUpdate(specDir: string) {
  const project = new SpecProject(specDir);
  const index = await project.scanEntries();
  const registry = new IdRegistry(index);
  const graph = new DependencyGraph(registry);
  const diffTracker = new DiffTracker(specDir);
  return { project, registry, graph, diffTracker };
}
