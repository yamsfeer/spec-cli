// ============================================================
// Spec CLI — 常量定义
// ============================================================

import type { EntryType, GenerateBatch, TemplateName } from './types.js';

// ---------- Spec 目录结构 ----------

export const SPEC_CATEGORIES = [
  '0_Project_Overview',
  '1_PRD',
  '2_Architecture',
  '3_Data_Model',
  '4_UI_UX',
  '5_Dev_Standards',
  '6_AI_Context',
  '7_Changelog',
] as const;

type SpecCategory = (typeof SPEC_CATEGORIES)[number];

export const SPEC_DIR_STRUCTURE: Record<
  SpecCategory,
  { dirs: string[]; files: string[] }
> = {
  '0_Project_Overview': {
    dirs: [],
    files: ['project_brief.md', 'glossary.md', 'constitution.md'],
  },
  '1_PRD': {
    dirs: [],
    files: ['prd_main.md', 'user_stories.md', 'functional_specs.md', 'non_functional.md'],
  },
  '2_Architecture': {
    dirs: ['api_design'],
    files: [
      'tech_stack.md',
      'system_architecture.md',
      'frontend_architecture.md',
      'backend_architecture.md',
      'data_flow.md',
      'api_design/endpoints_auth.md',
      'api_design/endpoints_business.md',
    ],
  },
  '3_Data_Model': {
    dirs: ['entities', 'schema'],
    files: ['er_diagram.md', 'data_dictionary.md', 'entities/user.md'],
  },
  '4_UI_UX': {
    dirs: ['user_flows', 'state_machines'],
    files: [
      'design_tokens.md',
      'component_library.md',
      'user_flows/flow_auth.md',
      'state_machines/component_states.md',
    ],
  },
  '5_Dev_Standards': {
    dirs: [],
    files: ['coding_style.md', 'naming_conventions.md', 'git_workflow.md', 'testing.md'],
  },
  '6_AI_Context': {
    dirs: [],
    files: ['prompt_templates.md', 'ai_rules.md', 'file_index.md'],
  },
  '7_Changelog': {
    dirs: [],
    files: ['change_log.md', 'adr.md'],
  },
};

// 所有必填文件（相对于 specs/ 目录）
export function getAllRequiredFiles(category: string): string[] {
  const cat = SPEC_DIR_STRUCTURE[category as SpecCategory];
  if (!cat) return [];
  return cat.files;
}

// ---------- ID 前缀映射 ----------

export const ID_PREFIXES: Partial<Record<EntryType, string>> = {
  project_brief: 'PB',
  glossary: 'GL',
  user_story: 'US',
  functional_spec: 'FS',
  non_functional_requirement: 'NFR',
  tech_stack: 'TS',
  system_architecture: 'SA',
  frontend_architecture: 'FA',
  backend_architecture: 'BA',
  api_endpoint: 'API',
  data_flow: 'DF',
  entity: 'ENT',
  field: 'FLD',
  design_token: 'DT',
  page_flow: 'PF',
  component_state_flow: 'CSF',
  component_spec: 'CS',
  coding_style: 'CST',
  naming_convention: 'NC',
  git_workflow: 'GW',
  adr: 'ADR',
  ai_prompt: 'AIPT',
  ai_rule: 'AIR',
};

// ---------- Batch 类别映射 ----------

export const BATCH_CATEGORIES: Record<GenerateBatch, string[]> = {
  prd: ['1_PRD'],
  architecture: ['2_Architecture', '3_Data_Model'],
  'data-model': ['3_Data_Model'],
  'ui-ux': ['4_UI_UX'],
  'dev-standards': ['5_Dev_Standards'],
  all: SPEC_CATEGORIES as unknown as string[],
};

// ---------- 模板名称映射 ----------

export const TEMPLATE_MAP: Record<TemplateName, string> = {
  'web-fullstack': 'web-fullstack',
  'mobile-app': 'mobile-app',
  'cli-tool': 'cli-tool',
  'api-service': 'api-service',
};

// ---------- 文件系统 ----------

export const REF_INDEX_FILE = '_ref_index.json';
export const CONFIG_FILE = '.spec-cli.json';
export const GLOBAL_CONFIG_FILE = '.spec-cli.json'; // in home directory
export const SPEC_DIR = 'specs';
export const CHANGES_DIR = '.spec-changes';

// ---------- 默认配置 ----------

export const DEFAULT_CONFIG = {
  version: '0.1.0',
  project: {
    name: '',
    spec_dir: `./${SPEC_DIR}`,
  },
  ai: {
    provider: 'openai' as const,
    model: 'gpt-4o',
    api_key_env: 'OPENAI_API_KEY',
  },
  agents: {
    pm: {
      interview_depth: 'standard' as const,
      language: 'zh-CN',
    },
    architect: {
      default_tech_stack: [],
      prefer_serverless: false,
    },
  },
  validate: {
    strict: false,
    auto_fix: false,
  },
};

// ---------- 索引版本 ----------

export const REF_INDEX_VERSION = '1.0';
