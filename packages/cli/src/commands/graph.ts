// ============================================================
// Spec CLI — graph 命令（基础版）
// ============================================================

import { Command } from 'commander';
import path from 'path';
import { output } from '../utils/output.js';
import { SpecProject, IdRegistry, DependencyGraph, Searcher } from '@spec-cli/core';

export const graphCommand = new Command('graph')
  .description('查询 Spec 引用关系与影响分析');

// graph context <ID>
graphCommand
  .command('context')
  .description('展示某个条目的完整上下文')
  .argument('<id>', '条目 ID')
  .option('--json', 'JSON 格式输出')
  .action(async (id, options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { graph } = await initGraph(specDir);
      const ctx = graph.buildContext(id);

      if (!ctx.entry) {
        output.error(`条目未找到: ${id}`);
        process.exit(1);
      }

      if (options.json) {
        output.json(ctx);
        return;
      }

      output.title(`${ctx.entry.id}: ${ctx.entry.title}`);
      output.divider();
      output.kv('Location', ctx.entry.file);
      output.kv('Summary', ctx.entry.summary || '(none)');
      output.kv('Upstream', ctx.upstream.map(e => e.id).join(', ') || '(none)');
      output.kv('Downstream', ctx.downstream.map(e => e.id).join(', ') || '(none)');
      output.kv('Tags', ctx.entry.tags.join(', ') || '(none)');
      output.kv('Status', `${ctx.entry.status} | Version: v${ctx.entry.version}`);

    } catch (err) {
      output.error(`查询失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// graph search <query>
graphCommand
  .command('search')
  .description('搜索 Spec 中的概念、ID、术语')
  .argument('<query>', '搜索词')
  .option('--json', 'JSON 格式输出')
  .action(async (query, options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { graph, searcher } = await initGraph(specDir);

      // ID 搜索
      const entryResults = graph.searchEntries(query);
      // 全文搜索
      const fullResults = await searcher.search(query);

      if (options.json) {
        output.json({ entryResults, fullResults });
        return;
      }

      output.title(`Search: "${query}"`);
      output.divider();

      if (entryResults.idMatches.length > 0) {
        output.info(`ID matches (${entryResults.idMatches.length}):`);
        for (const entry of entryResults.idMatches) {
          console.log(`  ${entry.id}: ${entry.title}`);
        }
      }

      if (entryResults.contentMatches.length > 0) {
        output.blank();
        output.info(`Content matches (${entryResults.contentMatches.length}):`);
        for (const { entry } of entryResults.contentMatches) {
          console.log(`  ${entry.file}`);
          console.log(`    └─ ${entry.id}: ${entry.title}`);
        }
      }

      if (fullResults.length > 0) {
        output.blank();
        output.info(`Text matches (${fullResults.length}):`);
        for (const r of fullResults.slice(0, 5)) {
          console.log(`  ${r.file}:${r.line}`);
        }
      }

      const total = entryResults.idMatches.length + entryResults.contentMatches.length + fullResults.length;
      console.log(`\nFound ${total} results`);

    } catch (err) {
      output.error(`搜索失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// graph caller <ID>
graphCommand
  .command('caller')
  .description('查询谁引用了这个条目')
  .argument('<id>', '条目 ID')
  .option('--depth <number>', '查询深度', '2')
  .option('--json', 'JSON 格式输出')
  .action(async (id, options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { graph } = await initGraph(specDir);
      const depth = parseInt(options.depth) || 2;
      const callers = graph.getCallers(id, depth);

      if (options.json) {
        output.json(callers);
        return;
      }

      output.title(`"${id}" is referenced by:`);
      output.divider();

      if (callers.direct.length > 0) {
        output.info(`Direct references (${callers.direct.length}):`);
        for (const e of callers.direct) {
          console.log(`  ├── ${e.id}: ${e.title}`);
        }
      }

      if (callers.indirect.length > 0) {
        output.info(`Indirect references (${callers.indirect.length}):`);
        for (const e of callers.indirect) {
          const via = e.dependencies.filter(d => d !== id).join(', ');
          console.log(`  └── ${e.id}: ${e.title} (via ${via})`);
        }
      }

      const total = callers.direct.length + callers.indirect.length;
      if (total > 0) {
        output.warn(`Deleting this entry affects ${total} references`);
      }

    } catch (err) {
      output.error(`查询失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// graph impact <ID>
graphCommand
  .command('impact')
  .description('分析修改该条目的影响半径')
  .argument('<id>', '条目 ID')
  .option('--depth <number>', '分析深度', '3')
  .option('--json', 'JSON 格式输出')
  .action(async (id, options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { graph } = await initGraph(specDir);
      const depth = parseInt(options.depth) || 3;
      const impact = graph.impactAnalysis(id, depth);

      if (options.json) {
        output.json(impact);
        return;
      }

      output.title(`Impact analysis for "${id}":`);
      output.divider();

      if (impact.direct.length > 0) {
        output.info('Direct downstream (must update):');
        for (const e of impact.direct) {
          console.log(`  └── ${e.id}: ${e.title} (${e.file})`);
        }
      }

      if (impact.indirect.length > 0) {
        output.blank();
        output.warn('Indirect downstream (review suggested):');
        for (const e of impact.indirect) {
          console.log(`  ├── ${e.id}: ${e.title} (${e.file})`);
        }
      }

      output.blank();
      output.title('Scope:');
      output.kv('Impact depth', `${depth} levels`);
      output.kv('Files affected', impact.filesAffected);
      output.kv('Entries touched', impact.direct.length + impact.indirect.length);
      output.kv('Impact score', `${impact.score}/10`);

    } catch (err) {
      output.error(`分析失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// graph status
graphCommand
  .command('status')
  .description('Spec 整体健康度报告')
  .action(async (_options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { registry } = await initGraph(specDir);
      const entries = registry.getAllEntries();
      const orphans = registry.findOrphans();
      const dangling = registry.findDanglingRefs();

      const refHealth = entries.length > 0
        ? ((entries.length - dangling.length) / entries.length) * 100
        : 100;

      output.title('Spec Health Report');
      output.divider();
      output.kv('Total entries', entries.length);
      output.progress('Ref health', refHealth);
      output.blank();

      if (orphans.length > 0) {
        output.warn(`Orphan entries: ${orphans.length}`);
      }
      if (dangling.length > 0) {
        output.warn(`Dangling references: ${dangling.length}`);
      }
      if (orphans.length === 0 && dangling.length === 0) {
        output.ok('No issues found');
      }

    } catch (err) {
      output.error(`查询失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// graph diff
graphCommand
  .command('diff')
  .description('未提交变更的影响概览')
  .action(async (_options, cmd) => {
    const specDir = getSpecDir(cmd);
    try {
      const { diffTracker } = await initGraph(specDir);
      const changes = diffTracker.getPendingChanges();

      if (changes.length === 0) {
        output.info('No pending changes');
        return;
      }

      output.title('Uncommitted Changes');
      output.divider();
      for (const change of changes) {
        output.kv(`[${change.status.toUpperCase()}]`, `${change.entry_id}: ${change.description}`);
      }

    } catch (err) {
      output.error(`查询失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// -------- helper --------

function getSpecDir(cmd: Command): string {
  // 向上查找父命令的 --spec-dir 选项
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

async function initGraph(specDir: string) {
  const project = new SpecProject(specDir);
  const index = await project.scanEntries();
  const registry = new IdRegistry(index);
  const graph = new DependencyGraph(registry);
  const searcher = new Searcher(specDir);
  const diffTracker = project['diffTracker'] || null;
  return { project, registry, graph, searcher, diffTracker };
}
