// ============================================================
// Spec CLI — Agent 基类
// ============================================================

import type { Entry, ProjectBrief } from '@spec-cli/shared';

export interface InterviewQuestion {
  id: string;
  question: string;
  hint?: string;
  required: boolean;
  validate?: (answer: string) => string | true;
}

export interface InterviewPhase {
  name: string;
  description: string;
  questions: InterviewQuestion[];
}

export interface InterviewContext {
  projectBrief: ProjectBrief;
  answers: Record<string, string>;
  collectedData: Record<string, unknown>;
}

export abstract class Agent {
  abstract readonly name: string;
  abstract readonly description: string;

  protected context: InterviewContext;

  constructor(projectBrief: ProjectBrief) {
    this.context = {
      projectBrief,
      answers: {},
      collectedData: {},
    };
  }

  /**
   * 获取访谈的所有阶段
   */
  abstract getPhases(): InterviewPhase[];

  /**
   * 记录用户回答
   */
  recordAnswer(questionId: string, answer: string): void {
    this.context.answers[questionId] = answer;
  }

  /**
   * 获取当前上下文
   */
  getContext(): InterviewContext {
    return { ...this.context };
  }

  /**
   * 生成最终输出内容
   */
  abstract generateOutput(): Promise<Array<{ file: string; content: string }>>;

  /**
   * 格式化 Markdown 输出 - 提取实体
   */
  protected formatEntry(entry: Partial<Entry>, content: string): string {
    const frontMatter = [
      '---',
      `id: ${entry.id || 'TBD'}`,
      `type: ${entry.type || 'unknown'}`,
      `title: ${entry.title || 'TBD'}`,
      `status: ${entry.status || 'draft'}`,
      `version: ${entry.version || 1}`,
      `tags: [${(entry.tags || []).join(', ')}]`,
      `dependencies: [${(entry.dependencies || []).join(', ')}]`,
      entry.summary ? `summary: ${entry.summary}` : null,
      '---',
    ]
      .filter(Boolean)
      .join('\n');

    return `${frontMatter}\n\n${content}`;
  }

  /**
   * 使用 AI 占位生成内容
   * 当 AI SDK 未配置时，返回结构化的占位提示
   */
  protected async aiGenerate(prompt: string, context: Record<string, unknown>): Promise<string> {
    // TODO: 集成 Vercel AI SDK
    // 目前返回占位内容
    const contextStr = Object.entries(context)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');

    return `<!-- AI_GENERATED_PLACEHOLDER
Prompt: ${prompt}
Context:
${contextStr}
-->
> 此内容由 AI 生成，待配置 AI 服务后填充。`;
  }

  /**
   * 保存收集到的数据
   */
  protected setCollected(key: string, value: unknown): void {
    this.context.collectedData[key] = value;
  }

  /**
   * 获取收集到的数据
   */
  protected getCollected<T = unknown>(key: string): T | undefined {
    return this.context.collectedData[key] as T | undefined;
  }
}
