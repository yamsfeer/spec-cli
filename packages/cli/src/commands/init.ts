// ============================================================
// Spec CLI — init 命令
// ============================================================

import { Command } from 'commander';
import * as p from '@clack/prompts';
import path from 'path';
import { output } from '../utils/output.js';
import { SpecProject, TemplateEngine } from '@spec-cli/core';
import type { ProjectBrief, TemplateName } from '@spec-cli/shared';
import { SPEC_CATEGORIES, SPEC_DIR_STRUCTURE } from '@spec-cli/shared';

export const initCommand = new Command('init')
  .description('初始化一个新的 Spec 项目')
  .option('--template <name>', '使用预设模板 (web-fullstack, mobile-app, cli-tool, api-service)')
  .option('--from <file>', '从已有文件导入初始声明')
  .option('--bare', '只生成骨架不对话')
  .option('--output <path>', '指定输出目录', process.cwd())
  .action(async (options) => {
    const outputDir = path.resolve(options.output);
    const specDir = path.join(outputDir, 'specs');

    console.log('');
    output.title('Spec CLI — 项目初始化');
    output.divider();

    let projectBrief: ProjectBrief;

    if (options.from) {
      // TODO: 从文件导入
      output.info(`从文件导入: ${options.from}`);
      projectBrief = parseProjectBrief(options.from);
    } else if (options.bare) {
      // 裸模式：最简信息
      projectBrief = {
        name: path.basename(outputDir),
        tagline: '',
        description: '',
        target_users: [],
        core_scenarios: [],
        tech_preferences: [],
      };
    } else {
      // 交互式对话
      projectBrief = await interactiveInterview();
    }

    if (p.isCancel(projectBrief as unknown as symbol)) {
      output.warn('已取消初始化');
      process.exit(0);
    }

    try {
      // 初始化项目
      const templateName = (options.template as TemplateName) || undefined;
      const engine = new TemplateEngine();
      const project = new SpecProject(specDir);

      // 使用模板引擎生成骨架
      const createdFiles = await engine.generateSkeleton(
        specDir,
        projectBrief,
        templateName as string
      );

      // 扫描并建立索引
      await project.scanEntries();

      // 输出报告
      output.blank();
      output.ok('Project spec created');
      output.blank();
      output.kv('Path', specDir);

      let totalFiles = 0;
      for (const cat of SPEC_CATEGORIES) {
        const struct = SPEC_DIR_STRUCTURE[cat];
        totalFiles += struct.files.length;
      }

      output.kv('Files', `${createdFiles.length} created, ${totalFiles - createdFiles.length} pending`);
      output.kv('Agent', 'PM Agent ready for interview');
      output.blank();
      output.info('Next: spec-cli generate --batch prd');

    } catch (err) {
      output.error(`初始化失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

/**
 * 交互式访谈获取项目信息
 */
async function interactiveInterview(): Promise<ProjectBrief> {
  const pGroup = await p.group(
    {
      name: () =>
        p.text({
          message: '产品叫什么名字？',
          placeholder: '如 SubWise',
          validate: (v) => (!v ? '请输入产品名称' : undefined),
        }),
      tagline: () =>
        p.text({
          message: '一句话介绍它？',
          placeholder: '如：独立开发者的 SaaS 订阅管理工具',
        }),
      description: () =>
        p.text({
          message: '详细描述一下你的产品解决什么问题？',
          placeholder: '描述谁在什么场景下遇到什么痛点...',
        }),
      targetUsersIntro: () =>
        p.text({
          message: '谁会使用这个产品？列出目标用户（逗号分隔）',
          placeholder: '独立开发者, 小型创业团队, 产品经理',
        }),
      scenariosIntro: () =>
        p.text({
          message: '核心使用场景有哪些？（逗号分隔）',
          placeholder: '用户注册登录, 创建新项目, 管理订阅',
        }),
      techFrontend: () =>
        p.text({
          message: '前端技术偏好？（回车跳过）',
          placeholder: 'React / Vue / 小程序',
        }),
      techBackend: () =>
        p.text({
          message: '后端技术偏好？（回车跳过）',
          placeholder: 'Node.js / Python / Go',
        }),
    },
  );

  const targetUsers = pGroup.targetUsersIntro
    ? pGroup.targetUsersIntro.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const coreScenarios = pGroup.scenariosIntro
    ? pGroup.scenariosIntro.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const techPrefs = [pGroup.techFrontend, pGroup.techBackend].filter(Boolean) as string[];

  return {
    name: pGroup.name as string,
    tagline: pGroup.tagline as string,
    description: pGroup.description as string,
    target_users: targetUsers,
    core_scenarios: coreScenarios,
    tech_preferences: techPrefs,
  };
}

/**
 * 从已有文件解析项目简介
 */
function parseProjectBrief(filePath: string): ProjectBrief {
  // TODO: 实现文件解析
  return {
    name: 'from-file',
    tagline: '',
    description: '',
    target_users: [],
    core_scenarios: [],
    tech_preferences: [],
  };
}
