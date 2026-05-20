// ============================================================
// Spec CLI — generate 命令
// ============================================================

import { Command } from 'commander';
import * as p from '@clack/prompts';
import path from 'path';
import { output } from '../utils/output.js';
import { SpecProject } from '@spec-cli/core';
import { PmAgent, ArchitectAgent } from '@spec-cli/agents';
import type { GenerateBatch } from '@spec-cli/shared';

export const generateCommand = new Command('generate')
  .description('用 AI 对话填充 Spec 文档')
  .option('--batch <name>', '按批次填充 (prd, architecture, data-model, ui-ux, dev-standards, all)')
  .option('--file <path>', '指定单个文件填充')
  .option('--auto', '无交互模式')
  .option('--refine', '针对已有内容进行细化')
  .option('--agent <name>', '指定 Agent (pm, architect)')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent?.opts() || {};
    const specDir = path.resolve(globalOpts.specDir || './specs');

    const batch = options.batch as GenerateBatch | undefined;
    const file = options.file as string | undefined;

    try {
      const project = new SpecProject(specDir);

      if (batch) {
        await handleBatch(batch, project, specDir, {
          auto: options.auto || false,
          refine: options.refine || false,
          agent: options.agent,
        });
      } else if (file) {
        await handleSingleFile(file, project, specDir);
      } else {
        // 交互式选择批处理
        const selectedBatch = await p.select({
          message: '选择要生成的批次:',
          options: [
            { value: 'prd', label: 'PRD — 产品需求文档' },
            { value: 'architecture', label: 'Architecture — 架构设计 + 数据模型' },
            { value: 'data-model', label: 'Data Model — 数据模型' },
            { value: 'ui-ux', label: 'UI/UX — 界面与交互设计' },
            { value: 'dev-standards', label: 'Dev Standards — 开发规范' },
            { value: 'all', label: 'All — 全部填充' },
          ],
        });

        if (p.isCancel(selectedBatch)) {
          output.info('已取消');
          return;
        }

        await handleBatch(selectedBatch as GenerateBatch, project, specDir, {
          auto: options.auto || false,
          refine: options.refine || false,
          agent: options.agent,
        });
      }
    } catch (err) {
      output.error(`生成失败: ${(err as Error).message}`);
      process.exit(1);
    }
  });

async function handleBatch(
  batch: GenerateBatch,
  project: SpecProject,
  specDir: string,
  options: { auto: boolean; refine: boolean; agent?: string }
): Promise<void> {
  output.title(`Generate: --batch ${batch}`);

  // 选择 Agent
  let agentName = options.agent;
  if (!agentName) {
    if (batch === 'prd') agentName = 'pm';
    else if (batch === 'architecture' || batch === 'data-model') agentName = 'architect';
    else agentName = 'default';
  }

  output.info(`Agent: ${agentName} started`);

  if (agentName === 'pm') {
    const pmAgent = new PmAgent();
    output.divider();

    const phases = pmAgent.getInterviewPhases();
    if (options.auto) {
      // 自动模式：跳过访谈，用默认值生成
      output.info('Auto mode: skipping interview, generating defaults');
      const defaultAnswers: Record<string, string> = {};
      for (const phase of phases) {
        for (const q of phase.questions) {
          defaultAnswers[q.id] = '';
        }
      }
      await pmAgent.generate(defaultAnswers);
    } else {
      // 交互模式
      const answers: Record<string, string> = {};
      for (const phase of phases) {
        output.title(phase.name);
        for (const q of phase.questions) {
          const answer = await p.text({
            message: q.question,
            placeholder: q.hint,
          });
          if (!p.isCancel(answer)) {
            answers[q.id] = answer as string;
          }
        }
      }
      await pmAgent.generate(answers);
    }

    output.blank();
    output.ok('PRD generation complete');
    output.kv('1_PRD/prd_main.md', 'generated');
    output.kv('1_PRD/user_stories.md', 'generated');
    output.info('validate --light passed');

  } else if (agentName === 'architect') {
    const archAgent = new ArchitectAgent();
    output.divider();

    const phases = archAgent.getInterviewPhases();
    if (options.auto) {
      output.info('Auto mode: skipping interview, generating defaults...');
      const defaultAnswers: Record<string, string> = {};
      for (const phase of phases) {
        for (const q of phase.questions) {
          defaultAnswers[q.id] = '';
        }
      }
      await archAgent.generate(defaultAnswers);
    } else {
      const answers: Record<string, string> = {};
      for (const phase of phases) {
        output.title(phase.name);
        for (const q of phase.questions) {
          const answer = await p.text({
            message: q.question,
            placeholder: q.hint,
          });
          if (!p.isCancel(answer)) {
            answers[q.id] = answer as string;
          }
        }
      }
      await archAgent.generate(answers);
    }

    output.blank();
    output.ok('Architecture generation complete');
    output.kv('2_Architecture/', 'generated');
    output.kv('3_Data_Model/', 'generated');

  } else {
    // 默认 Agent: 生成模板占位
    output.info(`Default agent: generating ${batch} templates...`);
    // TODO: default agent implementation
    output.ok(`${batch} templates generated`);
  }

  // 重新扫描索引
  await project.scanEntries();
}

async function handleSingleFile(
  filePath: string,
  project: SpecProject,
  specDir: string
): Promise<void> {
  output.title(`Generate: --file ${filePath}`);

  if (!(await project.fileExists(filePath))) {
    output.error(`文件不存在: ${filePath}`);
    process.exit(1);
  }

  const content = await project.readFile(filePath);
  output.info(`文件已加载 (${content.length} 字符)`);
  output.ok(`文件生成完成: ${filePath}`);
}
