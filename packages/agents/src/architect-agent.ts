// ============================================================
// Spec CLI — Architect Agent（架构师 Agent）
// ============================================================

import { Agent, type InterviewPhase } from './agent-base.js';
import type { ProjectBrief } from '@spec-cli/shared';

/**
 * Architect Agent — 从 PRD 推理生成架构设计、数据模型、API 设计
 *
 * 核心能力:
 * - 从 PRD 提取架构约束
 * - 质量属性优先级排序
 * - 技术选型推理
 * - 架构模式匹配
 * - 数据建模
 * - API 设计
 * - ADR 自动生成
 */
export class ArchitectAgent extends Agent {
  readonly name = 'Architect Agent';
  readonly description = '从 PRD 推理生成架构设计、数据模型';

  constructor(projectBrief: ProjectBrief) {
    super(projectBrief);
  }

  getPhases(): InterviewPhase[] {
    return [
      {
        name: 'Phase 1: 需求理解',
        description: '从 PRD 提取架构约束，理解系统的规模需求',
        questions: [
          {
            id: 'expected_users',
            question: '预期的用户规模有多大？',
            hint: '这决定了架构选型（独立开发者 / 小型团队 / 企业级）',
            required: false,
          },
          {
            id: 'expected_data',
            question: '数据规模预估？主要存储什么类型的数据？',
            hint: '结构化数据？文件？时序数据？',
            required: false,
          },
          {
            id: 'realtime_needs',
            question: '需要实时功能吗？',
            hint: '如实时聊天、推送通知、协同编辑',
            required: false,
          },
        ],
      },
      {
        name: 'Phase 2: 质量属性优先级',
        description: '确定架构质量属性的优先级排序',
        questions: [
          {
            id: 'quality_performance',
            question: '性能的重要性（1-5）？',
            hint: '5 = 每毫秒都很重要',
            required: false,
          },
          {
            id: 'quality_maintainability',
            question: '可维护性的重要性（1-5）？',
            hint: '5 = 长期维护和迭代优先',
            required: false,
          },
          {
            id: 'quality_security',
            question: '安全性的重要性（1-5）？',
            hint: '5 = 处理敏感数据，合规要求高',
            required: false,
          },
          {
            id: 'quality_scalability',
            question: '可扩展性的重要性（1-5）？',
            hint: '5 = 预计快速增长',
            required: false,
          },
        ],
      },
      {
        name: 'Phase 3: 技术选型',
        description: '确定各层技术栈选择',
        questions: [
          {
            id: 'tech_frontend',
            question: '前端技术偏好？',
            hint: 'React / Vue / Next.js / 小程序?',
            required: false,
          },
          {
            id: 'tech_backend',
            question: '后端技术偏好？',
            hint: 'Node.js / Python / Go / Java?',
            required: false,
          },
          {
            id: 'tech_database',
            question: '数据库偏好？',
            hint: 'PostgreSQL / MySQL / MongoDB?',
            required: false,
          },
          {
            id: 'tech_deploy',
            question: '部署方案偏好？',
            hint: '自建服务器 / Vercel / AWS / 阿里云?',
            required: false,
          },
        ],
      },
      {
        name: 'Phase 4: 架构模式',
        description: '确定架构模式和 API 风格',
        questions: [
          {
            id: 'arch_model',
            question: '架构模式偏好？',
            hint: '单体 / 微服务 / Serverless?',
            required: false,
          },
          {
            id: 'api_style',
            question: 'API 风格偏好？',
            hint: 'RESTful / GraphQL / tRPC?',
            required: false,
          },
          {
            id: 'auth_method',
            question: '认证方案偏好？',
            hint: 'JWT / Session / OAuth2.0?',
            required: false,
          },
        ],
      },
      {
        name: 'Phase 5: 数据模型引导',
        description: '识别系统中的核心实体和关系',
        questions: [
          {
            id: 'core_entities',
            question: '系统中有哪些核心实体？',
            hint: '如用户、订单、商品、文章等',
            required: true,
          },
          {
            id: 'entity_relations',
            question: '这些实体之间是什么关系？',
            hint: 'User -has many-> Orders, Order -belongs to-> Product',
            required: false,
          },
        ],
      },
      {
        name: 'Phase 6: 确认与假设声明',
        description: '明确列出未确认的假设，供用户审查',
        questions: [
          {
            id: 'assumptions',
            question: '有哪些假设需要我确认？',
            hint: '根据之前的对话，我做了以下假设，请确认...',
            required: false,
          },
          {
            id: 'missing_pieces',
            question: '还有什么架构层面的考虑我遗漏了吗？',
            required: false,
          },
        ],
      },
    ];
  }

  /**
   * 生成架构设计相关文档
   */
  async generateOutput(): Promise<Array<{ file: string; content: string }>> {
    const answers = this.context.answers;

    const files: Array<{ file: string; content: string }> = [];

    // 1. tech_stack.md
    files.push({
      file: '2_Architecture/tech_stack.md',
      content: this.generateTechStack(answers),
    });

    // 2. system_architecture.md
    files.push({
      file: '2_Architecture/system_architecture.md',
      content: this.generateSystemArchitecture(answers),
    });

    // 3. API 设计
    files.push({
      file: '2_Architecture/api_design/endpoints_auth.md',
      content: this.generateAuthApi(answers),
    });
    files.push({
      file: '2_Architecture/api_design/endpoints_business.md',
      content: this.generateBusinessApi(answers),
    });

    // 4. 数据模型
    files.push({
      file: '3_Data_Model/er_diagram.md',
      content: this.generateERDiagram(answers),
    });
    files.push({
      file: '3_Data_Model/entities/user.md',
      content: this.generateUserEntity(answers),
    });

    // 5. ADR
    files.push({
      file: '7_Changelog/adr.md',
      content: this.generateADR(
        '技术栈选型决策',
        'draft',
        `基于规模预估和产品需求，需要选择前后端技术栈。
用户规模：${answers['expected_users'] || '待确认'}
数据规模：${answers['expected_data'] || '待确认'}`,
        `推荐技术栈：
前端：${answers['tech_frontend'] || '待选型'}
后端：${answers['tech_backend'] || '待选型'}
数据库：${answers['tech_database'] || '待选型'}
架构模式：${answers['arch_model'] || '待确认'}`,
        '做出技术选型后，团队成员需按此标准开发。如有异议需通过新的 ADR 来修改决策。'
      ),
    });

    return files;
  }

  private generateTechStack(answers: Record<string, string>): string {
    return this.formatEntry(
      {
        id: 'TS-001',
        type: 'tech_stack',
        title: '技术栈',
        status: 'draft',
        version: 1,
        tags: ['tech-stack'],
        dependencies: ['PRD-001'],
      },
      `# 技术栈

## 前端
- 框架：${answers['tech_frontend'] || '待选型'}
- 语言：TypeScript
- 状态管理：[待选型]
- UI 组件库：[待选型]
- 构建工具：Vite

## 后端
- 运行时/框架：${answers['tech_backend'] || '待选型'}
- API 风格：${answers['api_style'] || 'RESTful'}
- 认证方式：${answers['auth_method'] || 'JWT'}
- ORM：[待选型]

## 数据库
- 主数据库：${answers['tech_database'] || '待选型'}
- 缓存：[待选型]
- 文件存储：[待选型]

## 基础设施
- 部署：${answers['tech_deploy'] || '待选型'}
- 架构模式：${answers['arch_model'] || '待确认'}
- CI/CD：[待选型]
- 监控：[待选型]
`
    );
  }

  private generateSystemArchitecture(answers: Record<string, string>): string {
    const archModel = answers['arch_model'] || '分层架构';

    return this.formatEntry(
      {
        id: 'SA-001',
        type: 'system_architecture',
        title: '系统架构',
        status: 'draft',
        version: 1,
        tags: ['architecture'],
        dependencies: ['TS-001'],
      },
      `# 系统架构

## 架构概览

**架构风格**：${archModel}

## 关键设计决策

基于以下质量属性评估：
- 性能：${answers['quality_performance'] || '3'}/5
- 可维护性：${answers['quality_maintainability'] || '3'}/5
- 安全性：${answers['quality_security'] || '3'}/5
- 可扩展性：${answers['quality_scalability'] || '3'}/5

\`\`\`mermaid
graph TB
    subgraph "客户端层"
        A[Web 前端]
    end
    subgraph "应用层"
        B[API 网关]
        C[业务服务]
    end
    subgraph "数据层"
        D[${answers['tech_database'] || '主数据库'}]
        E[缓存]
    end
    A --> B --> C --> D
    C --> E
\`\`\`

## 模块说明

| 模块 | 职责 | 技术 |
|------|------|------|
| 前端 | 用户界面与交互 | ${answers['tech_frontend'] || '待选型'} |
| API 层 | 请求路由与校验 | ${answers['tech_backend'] || '待选型'} |
| 业务层 | 核心业务逻辑 | ${answers['tech_backend'] || '待选型'} |
| 数据层 | 数据持久化 | ${answers['tech_database'] || '待选型'} |
`
    );
  }

  private generateAuthApi(answers: Record<string, string>): string {
    return this.formatEntry(
      {
        id: 'API-AUTH-001',
        type: 'api_endpoint',
        title: '认证 API',
        status: 'draft',
        version: 1,
        tags: ['api', 'auth'],
        dependencies: ['US-001'],
      },
      `# 认证 API

## 端点列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /auth/register | 用户注册 | 否 |
| POST | /auth/login | 用户登录 | 否 |
| POST | /auth/logout | 用户登出 | 是 |
| GET | /auth/me | 获取当前用户 | 是 |

## 认证方式
${answers['auth_method'] || 'JWT'}

> 更多端点根据用户故事逐步补充。
`
    );
  }

  private generateBusinessApi(answers: Record<string, string>): string {
    return this.formatEntry(
      {
        id: 'API-BIZ-001',
        type: 'api_endpoint',
        title: '业务 API',
        status: 'draft',
        version: 1,
        tags: ['api', 'business'],
        dependencies: ['US-001'],
      },
      `# 业务 API

## 端点列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| *待补充* | *待补充* | *待补充* | — |

> 根据用户故事逐步补充业务 API 端点。每个端点需定义请求参数、响应格式和错误码。
`
    );
  }

  private generateERDiagram(answers: Record<string, string>): string {
    const entities = answers['core_entities'] || 'User';
    const relations = answers['entity_relations'] || '';

    return this.formatEntry(
      {
        id: 'ER-001',
        type: 'entity',
        title: 'ER 图',
        status: 'draft',
        version: 1,
        tags: ['data-model', 'er'],
        dependencies: ['PRD-001'],
      },
      `# ER 图

## 核心实体

核心实体：${entities}

${relations ? `实体关系：${relations}` : ''}

\`\`\`mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string name
        datetime created_at
        datetime updated_at
    }
\`\`\`

> 根据用户故事的实体分析逐步完善 ER 图。
`
    );
  }

  private generateUserEntity(answers: Record<string, string>): string {
    return this.formatEntry(
      {
        id: 'ENT-USER-001',
        type: 'entity',
        title: '用户实体',
        status: 'draft',
        version: 1,
        tags: ['data-model', 'entity', 'user'],
        dependencies: ['ER-001'],
      },
      `# 用户实体 (User)

## 字段定义

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID / string | PK, NOT NULL | 用户唯一标识 |
| email | string | UNIQUE, NOT NULL | 邮箱地址 |
| password_hash | string | NOT NULL | 密码哈希 |
| name | string | NOT NULL | 显示名称 |
| created_at | datetime | NOT NULL, DEFAULT now() | 创建时间 |
| updated_at | datetime | NOT NULL, DEFAULT now() | 更新时间 |

## 索引

- email (UNIQUE)
- created_at (BTREE)
`
    );
  }

  private generateADR(
    title: string,
    status: string,
    context: string,
    decision: string,
    consequences: string
  ): string {
    return this.formatEntry(
      {
        id: 'ADR-001',
        type: 'adr',
        title,
        status: 'draft',
        version: 1,
        tags: ['adr'],
        dependencies: [],
      },
      `# ADR-001: ${title}

## 状态
${status}

## 背景
${context}

## 决策
${decision}

## 后果
${consequences}
`
    );
  }
}
