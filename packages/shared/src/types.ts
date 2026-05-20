// ============================================================
// Spec CLI — 核心类型定义
// ============================================================

// ---------- Entry 类型 ----------

export type EntryType =
  | 'project_brief'
  | 'glossary'
  | 'user_story'
  | 'functional_spec'
  | 'non_functional_requirement'
  | 'tech_stack'
  | 'system_architecture'
  | 'frontend_architecture'
  | 'backend_architecture'
  | 'api_endpoint'
  | 'data_flow'
  | 'entity'
  | 'field'
  | 'design_token'
  | 'page_flow'
  | 'component_state_flow'
  | 'component_spec'
  | 'coding_style'
  | 'naming_convention'
  | 'git_workflow'
  | 'adr'
  | 'ai_prompt'
  | 'ai_rule';

export type EntryStatus = 'draft' | 'confirmed' | 'deprecated';

export interface Entry {
  id: string;
  type: EntryType;
  file: string;
  title: string;
  summary?: string;
  dependencies: string[];
  dependents: string[];
  tags: string[];
  status: EntryStatus;
  version: number;
  last_modified: string;
  checksum: string;
}

export interface RefIndex {
  version: string;
  project: string;
  last_updated: string;
  entries: Record<string, Entry>;
}

// ---------- 项目配置 ----------

export type AIProvider = 'openai' | 'anthropic' | 'local';

export interface SpecCliConfig {
  version: string;
  project: {
    name: string;
    spec_dir: string;
  };
  ai: {
    provider: AIProvider;
    model: string;
    api_key_env: string;
  };
  agents: {
    pm: {
      interview_depth: 'basic' | 'standard' | 'deep';
      language: string;
    };
    architect: {
      default_tech_stack?: string[];
      prefer_serverless: boolean;
    };
  };
  validate: {
    strict: boolean;
    auto_fix: boolean;
  };
}

// ---------- 校验相关 ----------

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationResult {
  severity: ValidationSeverity;
  category: string;
  file: string;
  message: string;
  fix?: string;
}

export interface ValidationReport {
  errors: ValidationResult[];
  warnings: ValidationResult[];
  info: ValidationResult[];
  completion: number;
  ref_health: number;
  passed: boolean;
}

// ---------- 状态报告 ----------

export interface CategoryStatus {
  name: string;
  total: number;
  filled: number;
  percentage: number;
}

export interface StatusReport {
  project_name: string;
  version: string;
  last_modified: string;
  total_files: number;
  filled_files: number;
  categories: CategoryStatus[];
  ref_health: number;
  dangling_refs: number;
  pending_changes: number;
}

// ---------- 命令参数 ----------

export type GenerateBatch =
  | 'prd'
  | 'architecture'
  | 'data-model'
  | 'ui-ux'
  | 'dev-standards'
  | 'all';

export type TemplateName =
  | 'web-fullstack'
  | 'mobile-app'
  | 'cli-tool'
  | 'api-service';

export type ExportFormat = 'ai-context' | 'openapi' | 'pdf' | 'json';

// ---------- 项目管理 ----------

export interface ProjectBrief {
  name: string;
  tagline: string;
  description: string;
  target_users: string[];
  core_scenarios: string[];
  tech_preferences: string[];
}

export interface ChangeRecord {
  id: number;
  entry_id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'applied' | 'rolled_back';
  created_at: string;
  modified_entries: string[];
  backup_dir?: string;
}
