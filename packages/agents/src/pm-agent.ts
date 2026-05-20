// ============================================================
// Spec CLI — PM Agent (产品经理 Agent)
// ============================================================

import { Agent } from './agent-base.js';
import type { InterviewPhase } from './agent-base.js';
import type { Entry, ProjectBrief } from '@spec-cli/shared';

export class PmAgent extends Agent {
  readonly name = 'PM Agent';
  readonly description = '结构化访谈用户，生成高质量 PRD';

  private phases: InterviewPhase[] = [];

  constructor(projectBrief: ProjectBrief) {
    super(projectBrief);
    this.phases = this.buildPhases();
  }

  getPhases(): InterviewPhase[] {
    return this.phases;
  }

  /**
   * 构建 7 个访谈阶段
   */
  private buildPhases(): InterviewPhase[] {
    return [
      // Phase 1: 产品愿景与边界
      {
        name: '产品愿景与边界',
        description: '明确产品的核心价值主张和范围边界',
        questions: [
          {
            id: 'vision_name',
            question: '你的产品叫什么名字？',
            hint: '取一个简洁好记的名字',
            required: true,
          },
          {
            id: 'vision_tagline',
            question: '用一句话介绍这个产品？',
            hint: '格式：帮助[目标用户]解决[什么问题]',
            required: true,
          },
          {
            id: 'vision_description',
            question: '详细描述一下你的产品愿景？',
            hint: '包括：为什么想做这个产品？核心差异化是什么？',
            required: true,
          },
          {
            id: 'vision_scope_in',
            question: '产品的核心功能范围是什么？（包含哪些）',
            hint: '列出 3-5 个核心功能',
            required: true,
          },
          {
            id: 'vision_scope_out',
            question: '明确不做什么？（功能边界）',
            hint: '避免范围蔓延，V1 版本边界清晰更重要',
            required: false,
          },
        ],
      },

      // Phase 2: 用户画像
      {
        name: '用户画像',
        description: '明确目标用户群体及其特征',
        questions: [
          {
            id: 'user_primary',
            question: '你的主要目标用户是谁？描述他们的典型特征。',
            hint: '包括：角色、技术水平、使用场景',
            required: true,
          },
          {
            id: 'user_pain_point',
            question: '这些用户当前面临的核心痛点是什么？',
            hint: '他们现在用什么方式解决？为什么不够好？',
            required: true,
          },
          {
            id: 'user_secondary',
            question: '是否有次要用户群体？他们的需求有何不同？',
            hint: '如果没有可以跳过',
            required: false,
          },
          {
            id: 'user_onboarding',
            question: '新用户第一次使用的体验你想怎么做？',
            hint: '包括：注册引导、新手教程、默认设置',
            required: false,
          },
        ],
      },

      // Phase 3: 核心场景
      {
        name: '核心场景',
        description: '梳理用户的核心使用场景和流程',
        questions: [
          {
            id: 'scenario_happy',
            question: '描述用户最核心的"快乐路径"是什么？',
            hint: '从头到尾完成一个最典型任务的过程',
            required: true,
          },
          {
            id: 'scenario_edge',
            question: '有哪些边界情况或异常场景需要考虑？',
            hint: '如：网络断开、数据为空、权限不足等',
            required: true,
          },
          {
            id: 'scenario_daily',
            question: '用户每天使用这个产品做什么？',
            hint: '日常使用频率最高的操作',
            required: false,
          },
        ],
      },

      // Phase 4: 功能与非功能需求
      {
        name: '功能与非功能需求',
        description: '逐步梳理功能需求和约束条件',
        questions: [
          {
            id: 'func_must_have',
            question: '哪些功能是 Must Have（必须有）的？',
            hint: '没有这些功能产品就无法上线',
            required: true,
          },
          {
            id: 'func_should_have',
            question: '哪些功能是 Should Have（应该有）的？',
            hint: '重要但不是第一版必须',
            required: false,
          },
          {
            id: 'func_could_have',
            question: '哪些功能是 Could Have（可以有）的？',
            hint: '锦上添花的功能',
            required: false,
          },
          {
            id: 'nf_performance',
            question: '对性能有什么要求？',
            hint: '如：页面加载时间、API 响应时间、并发用户数',
            required: false,
          },
          {
            id: 'nf_security',
            question: '有哪些安全方面的考虑？',
            hint: '如：认证方式、数据加密、权限控制',
            required: false,
          },
        ],
      },

      // Phase 5: 矛盾检测与取舍
      {
        name: '矛盾检测与取舍',
        description: '发现需求中的矛盾，引导优先级决策',
        questions: [
          {
            id: 'conflict_simple_vs_powerful',
            question: '你希望产品简单易用还是功能强大？如何权衡？',
            hint: '两者常矛盾，请给出具体的取舍策略',
            required: true,
          },
          {
            id: 'conflict_speed_vs_quality',
            question: '如果时间不够，你愿意砍功能还是延长时间？',
            hint: '考虑 MVP 交付时间',
            required: false,
          },
          {
            id: 'conflict_known_competitors',
            question: '有哪些已知的竞品？你和他们最大的区别是什么？',
            hint: '如果不知道具体竞品可以跳过',
            required: false,
          },
        ],
      },

      // Phase 6: 非功能性需求补充
      {
        name: '非功能性需求深化',
        description: '补充更详细的非功能性需求',
        questions: [
          {
            id: 'nf_platform',
            question: '目标平台是什么？（Web / 移动端 / 桌面 / API）',
            hint: '可以多选',
            required: true,
          },
          {
            id: 'nf_scale',
            question: '预期用户规模是多少？',
            hint: '日活跃用户数、数据量级预估',
            required: false,
          },
          {
            id: 'nf_international',
            question: '是否需要国际化/多语言支持？',
            hint: '包括 i18n、多时区、RTL 等',
            required: false,
          },
        ],
      },

      // Phase 7: 评审确认
      {
        name: '评审确认',
        description: '总结并确认生成的内容',
        questions: [
          {
            id: 'review_summary',
            question: '以下是我整理的产品需求摘要，请确认：[summary]',
            hint: '确认是否准确反映了你的想法',
            required: true,
          },
          {
            id: 'review_missing',
            question: '有没有我刚才没问到但你觉得重要的内容？',
            hint: '任何遗漏的功能、场景或约束',
            required: false,
          },
        ],
      },
    ];
  }

  /**
   * 生成 PRD 输出
   */
  async generateOutput(): Promise<Array<{ file: string; content: string }>> {
    const answers = this.context.answers;

    const files: Array<{ file: string; content: string }> = [];

    // 1. prd_main.md
    files.push({
      file: '1_PRD/prd_main.md',
      content: this.formatEntry(
        {
          id: 'PRD-001',
          type: 'glossary',
          title: '产品需求文档',
          status: 'draft',
          version: 1,
          tags: ['prd', 'core'],
          dependencies: ['PB-001'],
        },
        this.generatePrdMain(answers)
      ),
    });

    // 2. user_stories.md
    files.push({
      file: '1_PRD/user_stories.md',
      content: this.formatEntry(
        {
          id: 'US-001',
          type: 'user_story',
          title: '用户故事列表',
          status: 'draft',
          version: 1,
          tags: ['prd', 'user_stories'],
          dependencies: ['PRD-001'],
        },
        await this.generateUserStories(answers)
      ),
    });

    // 3. non_functional.md
    files.push({
      file: '1_PRD/non_functional.md',
      content: this.formatEntry(
        {
          id: 'NFR-001',
          type: 'non_functional_requirement',
          title: '非功能性需求',
          status: 'draft',
          version: 1,
          tags: ['prd', 'non_functional'],
          dependencies: ['PRD-001'],
        },
        this.generateNonFunctional(answers)
      ),
    });

    return files;
  }

  /**
   * 生成 PRD 主体内容
   */
  private generatePrdMain(answers: Record<string, string>): string {
    const name = answers['vision_name'] || '未命名产品';
    const tagline = answers['vision_tagline'] || '待补充';
    const description = answers['vision_description'] || '待补充';
    const scopeIn = answers['vision_scope_in'] || '待补充';
    const scopeOut = answers['vision_scope_out'] || '待补充';
    const primaryUser = answers['user_primary'] || '待补充';
    const painPoint = answers['user_pain_point'] || '待补充';
    const mustHave = answers['func_must_have'] || '待补充';
    const shouldHave = answers['func_should_have'] || '待补充';
    const couldHave = answers['func_could_have'] || '待补充';
    const platform = answers['nf_platform'] || 'Web';

    return `# ${name} — 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定位

${tagline}

### 1.2 产品愿景

${description}

### 1.3 目标平台

${platform}

## 2. 目标用户

### 主要用户

${primaryUser}

**核心痛点：** ${painPoint}

## 3. 功能范围

### Must Have (必须有)
${mustHave}

### Should Have (应该有)
${shouldHave}

### Could Have (可以有)
${couldHave}

## 4. 产品边界

### 范围内
${scopeIn}

### 范围外
${scopeOut}

## 5. 成功指标

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 核心功能完成度 | 100% | 功能列表核对 |
| 用户满意度 | > 4/5 | 用户反馈评分 |

> 本文档通过 PM Agent 结构化访谈生成，待用户确认。
`;
  }

  /**
   * 生成用户故事
   */
  private async generateUserStories(
    answers: Record<string, string>
  ): Promise<string> {
    const mustHave = answers['func_must_have'] || '';
    const happyPath = answers['scenario_happy'] || '';
    const edgeCases = answers['scenario_edge'] || '';
    const primaryUser = answers['user_primary'] || '用户';

    // 使用 AI 占位生成更详细的用户故事
    const aiStories = await this.aiGenerate(
      '基于以下信息生成 5-8 个用户故事，使用格式：作为[角色]，我希望[功能]，以便[价值]',
      {
        mustHave,
        happyPath,
        edgeCases,
        primaryUser,
      }
    );

    return `# 用户故事

> 以下用户故事基于访谈内容生成，请逐一确认和补充。

## 故事列表

### US-001：核心功能入口

**作为** ${primaryUser}
**我希望** 能够快速访问产品核心功能
**以便** 高效完成日常任务

**优先级**：P0

**验收标准**：
- WHEN 用户打开应用 THEN 看到清晰的功能入口
- WHEN 用户点击功能入口 THEN 进入对应功能页面

---

### US-002：核心操作流程

**作为** ${primaryUser}
**我希望** ${happyPath}
**以便** 完成核心任务

**优先级**：P0

**验收标准**：
- WHEN 用户执行核心操作 THEN 获得预期结果
- IF 操作失败 THEN 显示友好的错误提示

---

### US-003：异常处理

**作为** ${primaryUser}
**我希望** 系统在以下异常情况下给出清晰提示
**以便** 不被错误信息困扰

**优先级**：P0

**边缘情况**：
${edgeCases}

**验收标准**：
- WHEN ${edgeCases} THEN 显示明确的错误说明和恢复建议

---

${aiStories}

> 提示：请根据实际情况调整和补充用户故事。每个故事应有独立的验收标准。
`;
  }

  /**
   * 生成非功能性需求
   */
  private generateNonFunctional(answers: Record<string, string>): string {
    const performance = answers['nf_performance'] || '待补充';
    const security = answers['nf_security'] || '待补充';
    const scale = answers['nf_scale'] || '待补充';

    return `# 非功能性需求

## 1. 性能

${performance}

## 2. 安全性

${security}

## 3. 可扩展性

预期规模：${scale}

- 模块间低耦合，便于独立扩展
- 支持水平扩展
- 数据模型预留扩展字段

## 4. 可维护性

- 代码覆盖率 > 80%
- 完整的 API 文档
- 清晰的模块职责划分
- 统一的错误码体系

## 5. 兼容性

| 平台 | 要求 |
|------|------|
| 浏览器 | Chrome 最新版 + |
| 服务端 | Node.js 18+ |

> 本文档通过 PM Agent 生成，请根据实际需求补充完善。
`;
  }
}
