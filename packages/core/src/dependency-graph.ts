import type { Entry } from '@spec-cli/shared';
import type { IdRegistry } from './id-registry.js';

/**
 * DependencyGraph — 依赖拓扑查询。
 */
export class DependencyGraph {
  private registry: IdRegistry;

  constructor(registry: IdRegistry) {
    this.registry = registry;
  }

  /**
   * 构建条目上下文：上游（依赖） + 下游（被依赖）。
   */
  buildContext(id: string): {
    entry: Entry;
    upstream: Entry[];
    downstream: Entry[];
  } | null {
    const entry = this.registry.resolve(id);
    if (!entry) return null;

    return {
      entry,
      upstream: this.registry.getDependencies(id),
      downstream: this.registry.getDependents(id),
    };
  }

  /**
   * 查询引用者：直接引用 + 间接引用。
   */
  getCallers(id: string, depth = 3): {
    direct: Entry[];
    indirect: Entry[];
  } {
    const entry = this.registry.resolve(id);
    if (!entry) return { direct: [], indirect: [] };

    const direct = this.registry.getDependents(id);

    // 间接引用：向上遍历 dependents 多级
    const indirect: Entry[] = [];
    const visited = new Set<string>([id]);
    let current = [...direct];

    for (let level = 1; level < depth; level++) {
      const next: Entry[] = [];
      for (const e of current) {
        if (visited.has(e.id)) continue;
        visited.add(e.id);
        const deps = this.registry.getDependents(e.id);
        for (const d of deps) {
          if (!visited.has(d.id)) {
            indirect.push(d);
            next.push(d);
          }
        }
      }
      current = next;
    }

    return { direct, indirect };
  }

  /**
   * 全文搜索条目。
   */
  searchEntries(query: string): {
    idMatches: Entry[];
    contentMatches: { entry: Entry; snippets: string[] }[];
  } {
    const searchResults = this.registry.search(query);

    const idMatches: Entry[] = [];
    const contentMatches: { entry: Entry; snippets: string[] }[] = [];

    for (const { entry, matches } of searchResults) {
      if (matches.includes('id')) {
        idMatches.push(entry);
      } else {
        contentMatches.push({ entry, snippets: matches });
      }
    }

    return { idMatches, contentMatches };
  }

  /**
   * 影响分析：修改一个条目会影响哪些其他条目？
   */
  impactAnalysis(id: string, depth = 3): {
    entry: Entry | null;
    direct: Entry[];
    indirect: Entry[];
    filesAffected: number;
    entriesAffected: number;
    score: number;
  } {
    const entry = this.registry.resolve(id);
    if (!entry) {
      return {
        entry: null,
        direct: [],
        indirect: [],
        filesAffected: 0,
        entriesAffected: 0,
        score: 0,
      };
    }

    const { direct, indirect } = this.getCallers(id, depth);
    const allAffected = [...direct, ...indirect];
    const uniqueFiles = new Set(allAffected.map(e => e.file));
    const entriesAffected = allAffected.length;
    const filesAffected = uniqueFiles.size;

    // 影响评分：文件数 * 10 + 条目数 * 2，上限 10
    const rawScore = filesAffected * 2 + entriesAffected * 0.5;
    const score = Math.min(10, Math.round(rawScore));

    return {
      entry,
      direct,
      indirect,
      filesAffected,
      entriesAffected,
      score,
    };
  }
}
