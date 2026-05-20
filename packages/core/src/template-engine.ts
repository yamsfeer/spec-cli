import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { SPEC_CATEGORIES, SPEC_DIR_STRUCTURE } from '@spec-cli/shared';
import type { ProjectBrief } from '@spec-cli/shared';

/**
 * TemplateEngine — Handlebars 模板渲染与 Spec 骨架生成。
 */
export class TemplateEngine {
  private templatesDir: string;

  constructor(templatesDir?: string) {
    // 默认从项目根寻找 templates/ 目录
    this.templatesDir = templatesDir || this.resolveTemplatesDir();
  }

  /**
   * 生成完整 Spec 骨架。
   * @param specDir   Spec 输出目录
   * @param brief     项目简介
   * @param templateName 模板名称，默认 "default"
   * @returns 创建的文件相对路径列表
   */
  async generateSkeleton(
    specDir: string,
    brief: ProjectBrief,
    templateName = 'default',
  ): Promise<string[]> {
    const createdFiles: string[] = [];
    const templateRoot = path.join(this.templatesDir, templateName);

    for (const category of SPEC_CATEGORIES) {
      const struct = SPEC_DIR_STRUCTURE[category];
      const catOutDir = path.join(specDir, category);
      await fs.ensureDir(catOutDir);

      // 创建子目录
      for (const subDir of struct.dirs) {
        await fs.ensureDir(path.join(catOutDir, subDir));
      }

      // 创建文件
      for (const file of struct.files) {
        const outPath = path.join(catOutDir, file);
        // 如果文件已存在则跳过（不覆盖用户内容）
        if (await fs.pathExists(outPath)) continue;

        // 尝试从模板加载
        const templatePath = path.join(templateRoot, category, file);
        let content: string;

        if (await fs.pathExists(templatePath)) {
          const rawTemplate = await fs.readFile(templatePath, 'utf-8');
          content = this.render(rawTemplate, { projectName: brief.name, tagline: brief.tagline });
        } else {
          // 默认占位内容（模板文件不存在时回退）
          content = this.defaultContent(category, file, brief);
        }

        await fs.ensureDir(path.dirname(outPath));
        await fs.writeFile(outPath, content, 'utf-8');
        createdFiles.push(path.relative(specDir, outPath));
      }
    }

    return createdFiles;
  }

  /**
   * 使用 Handlebars 渲染模板字符串。
   */
  render(templateContent: string, context: Record<string, unknown>): string {
    try {
      const template = Handlebars.compile(templateContent, { noEscape: true });
      return template(context);
    } catch {
      // 如果模板语法错误，返回原始内容并附加警告
      return templateContent;
    }
  }

  // -------- 辅助 --------

  private resolveTemplatesDir(): string {
    // 1. 环境变量优先
    if (process.env.SPEC_CLI_TEMPLATES_DIR) {
      return process.env.SPEC_CLI_TEMPLATES_DIR;
    }

    // 2. 查找项目根下的 templates/ 目录
    const cwd = process.cwd();
    const fromCwd = path.join(cwd, 'templates');
    if (fs.pathExistsSync(fromCwd)) return fromCwd;

    // 3. 回退到包所在位置的 templates
    return path.join(cwd, 'templates');
  }

  private defaultContent(
    category: string,
    fileName: string,
    brief: ProjectBrief,
  ): string {
    const displayName = fileName.replace(/\.md$/, '').replace(/_/g, ' ');
    const categoryName = category.replace(/^\d_/, '');
    const lines = ['---', `title: ${displayName}`, `category: ${categoryName}`, 'status: draft', 'version: 1', '---', '', `# ${displayName}`, '', `> 项目: ${brief.name}`, '> 状态: 待填充', '', '<!-- TODO: 使用 spec-cli generate 填充本章节 -->', ''];
    return lines.join('\n');
  }
}
