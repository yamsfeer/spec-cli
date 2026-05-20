import type { Entry, RefIndex } from '@spec-cli/shared';

/**
 * IdRegistry — 全局 ID 注册与引用关系管理。
 */
export class IdRegistry {
  private entries: Map<string, Entry>;

  constructor(index: RefIndex) {
    this.entries = new Map(Object.entries(index.entries));
  }

  /** 获取底层索引数据 */
  toIndex(project: string): RefIndex {
    const entries: Record<string, Entry> = {};
    for (const [id, entry] of this.entries) {
      entries[id] = { ...entry };
    }
    return {
      version: '1.0',
      project,
      last_updated: new Date().toISOString(),
      entries,
    };
  }

  // -------- CRUD --------

  register(entry: Entry): void {
    this.entries.set(entry.id, { ...entry });
  }

  resolve(id: string): Entry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): Entry[] {
    return [...this.entries.values()];
  }

  /** 获取条目数量 */
  get size(): number {
    return this.entries.size;
  }

  // -------- 引用关系 --------

  /**
   * 注册引用关系：from 依赖于 to。
   */
  registerRef(fromId: string, toId: string): void {
    const from = this.entries.get(fromId);
    const to = this.entries.get(toId);
    if (!from || !to) return;

    if (!from.dependencies.includes(toId)) {
      from.dependencies.push(toId);
    }
    if (!to.dependents.includes(fromId)) {
      to.dependents.push(fromId);
    }
  }

  getDependents(id: string): Entry[] {
    const entry = this.entries.get(id);
    if (!entry) return [];
    return entry.dependents
      .map(depId => this.entries.get(depId))
      .filter((e): e is Entry => !!e);
  }

  getDependencies(id: string): Entry[] {
    const entry = this.entries.get(id);
    if (!entry) return [];
    return entry.dependencies
      .map(depId => this.entries.get(depId))
      .filter((e): e is Entry => !!e);
  }

  // -------- 健康检查 --------

  /** 查找孤儿条目（既无上游也无下游引用） */
  findOrphans(): Entry[] {
    const orphans: Entry[] = [];
    for (const entry of this.entries.values()) {
      if (entry.dependencies.length === 0 && entry.dependents.length === 0) {
        orphans.push(entry);
      }
    }
    return orphans;
  }

  /** 查找悬空引用 */
  findDanglingRefs(): { from: Entry; missingIds: string[] }[] {
    const result: { from: Entry; missingIds: string[] }[] = [];
    for (const entry of this.entries.values()) {
      const missing = entry.dependencies.filter(depId => !this.entries.has(depId));
      if (missing.length > 0) {
        result.push({ from: entry, missingIds: missing });
      }
    }
    return result;
  }

  // -------- 查询 --------

  findByType(type: string): Entry[] {
    return [...this.entries.values()].filter(e => e.type === type);
  }

  findByTag(tag: string): Entry[] {
    return [...this.entries.values()].filter(e => e.tags.includes(tag));
  }

  /**
   * 模糊搜索：匹配 id、title、summary。
   */
  search(query: string): { entry: Entry; matches: string[] }[] {
    const lower = query.toLowerCase();
    const results: { entry: Entry; matches: string[] }[] = [];

    for (const entry of this.entries.values()) {
      const matches: string[] = [];
      if (entry.id.toLowerCase().includes(lower)) matches.push('id');
      if (entry.title.toLowerCase().includes(lower)) matches.push('title');
      if (entry.summary?.toLowerCase().includes(lower)) matches.push('summary');
      for (const tag of entry.tags) {
        if (tag.toLowerCase().includes(lower)) {
          matches.push('tag');
          break;
        }
      }
      if (matches.length > 0) {
        results.push({ entry, matches });
      }
    }
    return results;
  }
}
