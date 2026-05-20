// ============================================================
// Spec CLI — Zod Schema 定义
// ============================================================

import { z } from 'zod';

// ---------- Entry Schema ----------

export const EntryStatusSchema = z.enum(['draft', 'confirmed', 'deprecated']);

export const EntryTypeSchema = z.enum([
  'project_brief',
  'glossary',
  'user_story',
  'functional_spec',
  'non_functional_requirement',
  'tech_stack',
  'system_architecture',
  'frontend_architecture',
  'backend_architecture',
  'api_endpoint',
  'data_flow',
  'entity',
  'field',
  'design_token',
  'page_flow',
  'component_state_flow',
  'component_spec',
  'coding_style',
  'naming_convention',
  'git_workflow',
  'adr',
  'ai_prompt',
  'ai_rule',
]);

export const EntrySchema = z.object({
  id: z.string(),
  type: EntryTypeSchema,
  file: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  dependencies: z.array(z.string()),
  dependents: z.array(z.string()),
  tags: z.array(z.string()),
  status: EntryStatusSchema,
  version: z.number(),
  last_modified: z.string(),
  checksum: z.string(),
});

export const RefIndexSchema = z.object({
  version: z.string(),
  project: z.string(),
  last_updated: z.string(),
  entries: z.record(z.string(), EntrySchema),
});

// ---------- Front Matter Schema ----------

export const FrontMatterSchema = z.object({
  id: z.string(),
  type: EntryTypeSchema,
  title: z.string(),
  status: EntryStatusSchema.default('draft'),
  version: z.number().default(1),
  tags: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  summary: z.string().optional(),
});

// ---------- Config Schema ----------

export const SpecCliConfigSchema = z.object({
  version: z.string(),
  project: z.object({
    name: z.string(),
    spec_dir: z.string(),
  }),
  ai: z.object({
    provider: z.enum(['openai', 'anthropic', 'local']),
    model: z.string(),
    api_key_env: z.string(),
  }),
  agents: z.object({
    pm: z.object({
      interview_depth: z.enum(['basic', 'standard', 'deep']),
      language: z.string(),
    }),
    architect: z.object({
      default_tech_stack: z.array(z.string()).optional(),
      prefer_serverless: z.boolean(),
    }),
  }),
  validate: z.object({
    strict: z.boolean(),
    auto_fix: z.boolean(),
  }),
});

// ---------- Project Brief Schema ----------

export const ProjectBriefSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  target_users: z.array(z.string()),
  core_scenarios: z.array(z.string()),
  tech_preferences: z.array(z.string()),
});
