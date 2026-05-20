import fs from 'fs-extra';
import path from 'path';

interface SearchResult {
  file: string;
  line: number;
  content: string;
}

interface RegexSearchResult {
  file: string;
  line: number;
  content: string;
  matches: string[];
}

/**
 * Searcher — Spec 目录全文搜索。
 */
export class Searcher {
  private specDir: string;

  constructor(specDir: string) {
    this.specDir = path.resolve(specDir);
  }

  /**
   * 全文搜索（大小写不敏感）。
   */
  async search(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    const mdFiles = await this.findMdFiles();

    for (const file of mdFiles) {
      const fullPath = path.join(this.specDir, file);
      try {
        const raw = await fs.readFile(fullPath, 'utf-8');
        const lines = raw.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(lowerQuery)) {
            results.push({
              file,
              line: i + 1,
              content: lines[i].trim(),
            });
          }
        }
      } catch {
        // 跳过无法读取的文件
      }
    }

    return results;
  }

  /**
   * 正则表达式搜索。
   */
  async searchRegex(pattern: string): Promise<RegexSearchResult[]> {
    const results: RegexSearchResult[] = [];
    let regex: RegExp;

    try {
      regex = new RegExp(pattern, 'gi');
    } catch {
      return results; // 无效正则，直接返回空
    }

    const mdFiles = await this.findMdFiles();

    for (const file of mdFiles) {
      const fullPath = path.join(this.specDir, file);
      try {
        const raw = await fs.readFile(fullPath, 'utf-8');
        const lines = raw.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const matches = lines[i].match(regex);
          if (matches && matches.length > 0) {
            results.push({
              file,
              line: i + 1,
              content: lines[i].trim(),
              matches: [...matches],
            });
          }
        }
      } catch {
        // 跳过无法读取的文件
      }
    }

    return results;
  }

  // -------- 辅助 --------

  private async findMdFiles(): Promise<string[]> {
    const files: string[] = [];
    const walk = async (dir: string) => {
      if (!(await fs.pathExists(dir))) return;
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
          files.push(path.relative(this.specDir, fullPath));
        }
      }
    };
    await walk(this.specDir);
    return files;
  }
}
