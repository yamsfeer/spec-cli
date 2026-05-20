import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { SPEC_DIR_STRUCTURE, SPEC_CATEGORIES } from '@spec-cli/shared';
import type { ValidationResult, ValidationReport } from '@spec-cli/shared';
import type { IdRegistry } from './id-registry.js';
import type { Entry } from '@spec-cli/shared';

/**
 * Validator — Spec 校验规则引擎。
 */
export class Validator {
  private registry: IdRegistry;
  private specDir: string;

  constructor(registry: IdRegistry, specDir: string) {
    this.registry = registry;
    this.specDir = path.resolve(specDir);
  }

  /**
   * 运行所有校验检查。
   */
  async validateAll(
    options: { strict?: boolean } = {},
  ): Promise<ValidationReport> {
    const errors: ValidationResult[] = [];
    const warnings: ValidationResult[] = [];
    const info: ValidationResult[] = [];

    // 结构检查
    const structureResults = await this.validateStructure();
    for (const r of structureResults) {
      if (r.severity === 'error') errors.push(r);
      else if (r.severity === 'warning') warnings.push(r);
      else info.push(r);
    }

    // Front Matter 检查
    const fmResults = await this.validateFrontMatter();
    for (const r of fmResults) {
      if (r.severity === 'error') errors.push(r);
      else if (r.severity === 'warning') warnings.push(r);
      else info.push(r);
    }

    // ID 唯一性
    const idResults = this.validateIds();
    for (const r of idResults) {
      errors.push(r); // ID 重复是 error
    }

    // 引用检查
    const refResults = this.validateRefs();
    for (const r of refResults) {
      if (r.severity === 'error') errors.push(r);
      else warnings.push(r);
    }

    // 孤儿条目
    const orphanResults = this.validateOrphanEntries();
    for (const r of orphanResults) {
      warnings.push(r);
    }

    // 内容完整性
    const contentResults = await this.validateContentCompleteness();
    for (const r of contentResults) {
      if (r.severity === 'error') errors.push(r);
      else warnings.push(r);
    }

    const strict = options.strict ?? false;

    // 计算完成率
    const totalFiles = this.countRequiredFiles();
    const filledFiles = await this.countFilledFiles();
    const completion = totalFiles > 0 ? Math.round((filledFiles / totalFiles) * 100) : 0;

    // 计算引用健康度
    const totalEntries = this.registry.getAllEntries().length;
    const danglingCount = this.registry.findDanglingRefs().length;
    const refHealth = totalEntries > 0
      ? Math.round(((totalEntries - danglingCount) / totalEntries) * 100)
      : 100;

    return {
      errors,
      warnings,
      info,
      completion,
      ref_health: refHealth,
      passed: errors.length === 0 && (!strict || warnings.length === 0),
    };
  }

  /**
   * 检查目录结构完整性。
   */
  async validateStructure(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const category of SPEC_CATEGORIES) {
      const catDir = path.join(this.specDir, category);
      if (!(await fs.pathExists(catDir))) {
        results.push({
          severity: 'error',
          category: '结构规范',
          file: category + '/',
          message: `缺少必需的目录: ${category}`,
        });
        continue;
      }

      const struct = SPEC_DIR_STRUCTURE[category];

      // 检查子目录
      for (const subDir of struct.dirs) {
        const subPath = path.join(catDir, subDir);
        if (!(await fs.pathExists(subPath))) {
          results.push({
            severity: 'error',
            category: '结构规范',
            file: path.join(category, subDir) + '/',
            message: `缺少必需的子目录: ${subDir}`,
          });
        }
      }

      // 检查文件
      for (const file of struct.files) {
        const filePath = path.join(catDir, file);
        if (!(await fs.pathExists(filePath))) {
          results.push({
            severity: 'warning',
            category: '结构规范',
            file: path.join(category, file),
            message: `缺少文件: ${file}`,
          });
        }
      }
    }

    return results;
  }

  /**
   * 检查所有 .md 文件的 Front Matter 完整性。
   */
  async validateFrontMatter(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const mdFiles = await this.findMdFiles();

    const requiredFields = ['id', 'type', 'title'];

    for (const file of mdFiles) {
      try {
        const raw = await fs.readFile(path.join(this.specDir, file), 'utf-8');
        const parsed = matter(raw);
        const fm = parsed.data as Record<string, unknown>;

        for (const field of requiredFields) {
          if (!fm[field]) {
            results.push({
              severity: 'error',
              category: 'Front Matter',
              file,
              message: `缺少必需字段: ${field}`,
            });
          }
        }

        // 检查 version 字段类型
        if (fm.version !== undefined && typeof fm.version !== 'number') {
          results.push({
            severity: 'warning',
            category: 'Front Matter',
            file,
            message: '字段 "version" 应为数字类型',
          });
        }

        // 检查 tags 为数组
        if (fm.tags !== undefined && !Array.isArray(fm.tags)) {
          results.push({
            severity: 'warning',
            category: 'Front Matter',
            file,
            message: '字段 "tags" 应为数组类型',
          });
        }
      } catch {
        results.push({
          severity: 'error',
          category: 'Front Matter',
          file,
          message: '无法解析文件的 Front Matter',
        });
      }
    }

    return results;
  }

  /**
   * 检查 ID 唯一性。
   */
  validateIds(): ValidationResult[] {
    const results: ValidationResult[] = [];
    const idCounts = new Map<string, { entry: Entry }[]>();

    for (const entry of this.registry.getAllEntries()) {
      const list = idCounts.get(entry.id) || [];
      list.push({ entry });
      idCounts.set(entry.id, list);
    }

    for (const [id, occurrences] of idCounts) {
      if (occurrences.length > 1) {
        const files = occurrences.map(o => o.entry.file).join(', ');
        results.push({
          severity: 'error',
          category: 'ID 体系',
          file: occurrences[0].entry.file,
          message: `ID "${id}" 不唯一，出现在: ${files}`,
        });
      }
    }

    return results;
  }

  /**
   * 检查引用完整性：悬空引用和双向引用。
   */
  validateRefs(): ValidationResult[] {
    const results: ValidationResult[] = [];

    // 悬空引用
    const dangling = this.registry.findDanglingRefs();
    for (const { from, missingIds } of dangling) {
      results.push({
        severity: 'error',
        category: '引用完整性',
        file: from.file,
        message: `${from.id} 引用了不存在的 ID: ${missingIds.join(', ')}`,
      });
    }

    // 双向引用检查
    for (const entry of this.registry.getAllEntries()) {
      for (const depId of entry.dependencies) {
        const dep = this.registry.resolve(depId);
        if (dep && !dep.dependents.includes(entry.id)) {
          results.push({
            severity: 'warning',
            category: '引用完整性',
            file: entry.file,
            message: `双向引用不一致: ${entry.id} → ${depId}，但 ${depId} 的 dependents 中未包含 ${entry.id}`,
            fix: `在 ${dep.file} 的 dependents 中补充 ${entry.id}`,
          });
        }
      }
    }

    return results;
  }

  /**
   * 检查孤儿条目。
   */
  validateOrphanEntries(): ValidationResult[] {
    const results: ValidationResult[] = [];
    const orphans = this.registry.findOrphans();

    for (const orphan of orphans) {
      results.push({
        severity: 'warning',
        category: '引用完整性',
        file: orphan.file,
        message: `孤立条目: ${orphan.id} "${orphan.title}" 没有任何引用关系`,
      });
    }

    return results;
  }

  /**
   * 检查内容完整性（必填章节非空）。
   */
  async validateContentCompleteness(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const mdFiles = await this.findMdFiles();

    for (const file of mdFiles) {
      try {
        const raw = await fs.readFile(path.join(this.specDir, file), 'utf-8');
        const parsed = matter(raw);
        const content = (parsed.content || '').trim();

        // 检查是否只有 TODO 占位符
        if (content.length === 0) {
          results.push({
            severity: 'warning',
            category: '内容完整性',
            file,
            message: '文件内容为空',
          });
        } else if (content === '<!-- TODO: 使用 spec-cli generate 填充本章节 -->') {
          results.push({
            severity: 'warning',
            category: '内容完整性',
            file,
            message: '文件仅含占位注释，尚未填充内容',
          });
        }
      } catch {
        // 已经在 validateFrontMatter 中处理
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
        } else if (entry.name.endsWith('.md')) {
          files.push(path.relative(this.specDir, fullPath));
        }
      }
    };
    await walk(this.specDir);
    return files;
  }

  private countRequiredFiles(): number {
    let count = 0;
    for (const category of SPEC_CATEGORIES) {
      const struct = SPEC_DIR_STRUCTURE[category];
      count += struct.files.length;
    }
    return count;
  }

  private async countFilledFiles(): Promise<number> {
    let count = 0;
    const mdFiles = await this.findMdFiles();

    for (const file of mdFiles) {
      try {
        const raw = await fs.readFile(path.join(this.specDir, file), 'utf-8');
        const parsed = matter(raw);
        const content = (parsed.content || '').trim();
        if (content.length > 0 && !content.startsWith('<!-- TODO')) {
          count++;
        }
      } catch {
        // skip
      }
    }

    return count;
  }
}
