import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import {
  SPEC_CATEGORIES,
  SPEC_DIR_STRUCTURE,
  REF_INDEX_FILE,
  REF_INDEX_VERSION,
} from '@spec-cli/shared';
import type {
  ProjectBrief,
  RefIndex,
  Entry,
  EntryType,
  EntryStatus,
} from '@spec-cli/shared';

/**
 * SpecProject — 管理 spec 项目文件读写与索引维护。
 */
export class SpecProject {
  private specDir: string;

  constructor(specDir: string) {
    this.specDir = path.resolve(specDir);
  }

  /** 获取 specs 目录绝对路径 */
  get dir(): string {
    return this.specDir;
  }

  // -------- 初始化 --------

  /**
   * 创建完整目录结构，写入 project_brief.md，生成初始 _ref_index.json。
   */
  async init(projectBrief: ProjectBrief): Promise<void> {
    // 创建分类目录
    for (const category of SPEC_CATEGORIES) {
      const struct = SPEC_DIR_STRUCTURE[category];
      const catDir = path.join(this.specDir, category);
      await fs.ensureDir(catDir);

      for (const subDir of struct.dirs) {
        await fs.ensureDir(path.join(catDir, subDir));
      }

      for (const file of struct.files) {
        const filePath = path.join(catDir, file);
        if (!(await fs.pathExists(filePath))) {
          await fs.ensureDir(path.dirname(filePath));
          await fs.writeFile(filePath, this.defaultContent(category, file, projectBrief));
        }
      }
    }

    // 生成初始索引
    const index: RefIndex = {
      version: REF_INDEX_VERSION,
      project: projectBrief.name,
      last_updated: new Date().toISOString(),
      entries: {},
    };
    await this.saveIndex(index);
  }

  // -------- 文件读写 --------

  async readFile(relativePath: string): Promise<string> {
    const fullPath = path.join(this.specDir, relativePath);
    return fs.readFile(fullPath, 'utf-8');
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.specDir, relativePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async fileExists(relativePath: string): Promise<boolean> {
    return fs.pathExists(path.join(this.specDir, relativePath));
  }

  /** 递归获取 specs 目录下所有文件（相对路径） */
  async getAllFiles(): Promise<string[]> {
    const files: string[] = [];
    const walk = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== '.spec-changes') {
          await walk(fullPath);
        } else if (entry.isFile()) {
          files.push(path.relative(this.specDir, fullPath));
        }
      }
    };
    if (await fs.pathExists(this.specDir)) {
      await walk(this.specDir);
    }
    return files;
  }

  getCategories(): string[] {
    return [...SPEC_CATEGORIES];
  }

  // -------- 索引管理 --------

  async loadIndex(): Promise<RefIndex> {
    const indexPath = path.join(this.specDir, REF_INDEX_FILE);
    if (await fs.pathExists(indexPath)) {
      const raw = await fs.readJson(indexPath);
      return raw as RefIndex;
    }
    return {
      version: REF_INDEX_VERSION,
      project: '',
      last_updated: new Date().toISOString(),
      entries: {},
    };
  }

  async saveIndex(index: RefIndex): Promise<void> {
    index.last_updated = new Date().toISOString();
    const indexPath = path.join(this.specDir, REF_INDEX_FILE);
    await fs.writeJson(indexPath, index, { spaces: 2 });
  }

  /**
   * 扫描所有 .md 文件，解析 Front Matter 和内联 @ref() 构建索引。
   */
  async scanEntries(): Promise<RefIndex> {
    const files = await this.getAllFiles();
    const mdFiles = files.filter(f => f.endsWith('.md'));
    const entries: Record<string, Entry> = {};

    for (const file of mdFiles) {
      try {
        const raw = await this.readFile(file);
        const parsed = matter(raw);
        const fm = parsed.data as Record<string, unknown>;
        const content = parsed.content || '';

        // 必须有 id 和 type
        if (!fm.id || !fm.type) continue;

        const id = String(fm.id);
        const type = String(fm.type) as EntryType;
        const title = String(fm.title || file);
        const status = (fm.status as EntryStatus) || 'draft';
        const version = Number(fm.version || 1);
        const tags = Array.isArray(fm.tags)
          ? fm.tags.map(String)
          : [];
        const summary = fm.summary ? String(fm.summary) : undefined;

        // 从 Front Matter dependencies 取值
        const fmDeps: string[] = Array.isArray(fm.dependencies)
          ? fm.dependencies.map(String)
          : [];

        // 从正文解析 @ref(ID) 引用
        const inlineRefs = parseInlineRefs(content);

        // 合并去重
        const allDeps = [...new Set([...fmDeps, ...inlineRefs])];

        entries[id] = {
          id,
          type,
          file,
          title,
          summary,
          dependencies: allDeps,
          dependents: [],
          tags,
          status,
          version,
          last_modified: new Date().toISOString(),
          checksum: computeChecksum(raw),
        };
      } catch {
        // 跳过无法解析的文件
      }
    }

    // 计算反向 dependents
    for (const entry of Object.values(entries)) {
      for (const depId of entry.dependencies) {
        const target = entries[depId];
        if (target && !target.dependents.includes(entry.id)) {
          target.dependents.push(entry.id);
        }
      }
    }

    const projectName = await this.readProjectName();
    const index: RefIndex = {
      version: REF_INDEX_VERSION,
      project: projectName,
      last_updated: new Date().toISOString(),
      entries,
    };

    await this.saveIndex(index);
    return index;
  }

  /** 从源文件重建索引（等价于 scanEntries） */
  async rebuildIndex(): Promise<RefIndex> {
    return this.scanEntries();
  }

  // -------- 辅助方法 --------

  private async readProjectName(): Promise<string> {
    try {
      const briefPath = path.join(this.specDir, '0_Project_Overview', 'project_brief.md');
      if (await fs.pathExists(briefPath)) {
        const raw = await fs.readFile(briefPath, 'utf-8');
        const parsed = matter(raw);
        const fm = parsed.data as Record<string, unknown>;
        return String(fm.name || fm.title || '');
      }
    } catch {
      // ignore
    }
    return '';
  }

  private defaultContent(
    category: string,
    fileName: string,
    brief: ProjectBrief,
  ): string {
    const displayName = fileName.replace(/\.md$/, '');
    const categoryName = category.replace(/^\d_/, '');
    return [
      '---',
      `title: ${displayName}`,
      `category: ${categoryName}`,
      'status: draft',
      'version: 1',
      '---',
      '',
      `# ${displayName}`,
      '',
      `> 项目: ${brief.name}`,
      '> 状态: 待填充',
      '',
      '<!-- TODO: 使用 spec-cli generate 填充本章节 -->',
      '',
    ].join('\n');
  }
}

// -------- 工具函数 --------

/** 解析正文中的 @ref(ID) 引用 */
function parseInlineRefs(content: string): string[] {
  const refs: string[] = [];
  const regex = /@ref\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    refs.push(match[1].trim());
  }
  return [...new Set(refs)];
}

/** 简单 hash（基于字符串累加） */
export function computeChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const chr = content.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
