// ============================================================
// Spec CLI — 终端输出美化工具
// ============================================================

import chalk from 'chalk';

export interface OutputOptions {
  indent?: number;
  prefix?: string;
}

const defaultOptions: OutputOptions = {
  indent: 0,
  prefix: '',
};

function indentStr(indent: number): string {
  return '  '.repeat(Math.max(0, indent));
}

// ---- 标题 ----

export function title(text: string, indent = 0): void {
  const prefix = indentStr(indent);
  console.log(`\n${prefix}${chalk.bold.cyan(text)}`);
  console.log(`${prefix}${chalk.gray('─'.repeat(text.length + 4))}`);
}

// ---- 成功 ----

export function ok(text: string, indent = 0): void {
  console.log(`${indentStr(indent)}${chalk.green('[OK]')} ${text}`);
}

// ---- 错误 ----

export function error(text: string, indent = 0): void {
  console.log(`${indentStr(indent)}${chalk.red('[ERROR]')} ${text}`);
}

// ---- 警告 ----

export function warn(text: string, indent = 0): void {
  console.log(`${indentStr(indent)}${chalk.yellow('[WARN]')} ${text}`);
}

// ---- 信息 ----

export function info(text: string, indent = 0): void {
  console.log(`${indentStr(indent)}${chalk.blue('[INFO]')} ${text}`);
}

// ---- 进度条 ----

export function progressBar(percentage: number, width = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  return `${bar} ${percentage}%`;
}

// ---- 表格 ----

export function table(
  headers: string[],
  rows: string[][],
  opts?: { indent?: number }
): void {
  const indent = indentStr(opts?.indent ?? 0);

  // 计算每列最大宽度
  const colWidths = headers.map((h, i) => {
    const maxRow = Math.max(...rows.map((r) => (r[i] ?? '').length));
    return Math.max(h.length, maxRow);
  });

  // 打印表头
  const headerLine = headers
    .map((h, i) => chalk.bold(h.padEnd(colWidths[i])))
    .join('  ');
  console.log(`${indent}${headerLine}`);
  console.log(
    `${indent}${colWidths.map((w) => '-'.repeat(w)).join('  ')}`
  );

  // 打印行
  for (const row of rows) {
    const line = row
      .map((cell, i) => (cell ?? '').padEnd(colWidths[i]))
      .join('  ');
    console.log(`${indent}${line}`);
  }
}

// ---- 列表 ----

export function list(items: string[], opts?: { bullet?: string; indent?: number }): void {
  const bullet = opts?.bullet ?? '•';
  const indent = indentStr(opts?.indent ?? 0);
  for (const item of items) {
    console.log(`${indent}${chalk.dim(bullet)} ${item}`);
  }
}

// ---- 键值对 ----

export function kv(key: string, value: string, indent = 0): void {
  const prefix = indentStr(indent);
  console.log(`${prefix}${chalk.dim(key + ':')} ${chalk.white(value)}`);
}

// ---- 分隔线 ----

export function divider(indent = 0): void {
  console.log(`${indentStr(indent)}${chalk.gray('─'.repeat(50))}`);
}

// ---- JSON 输出 ----

export function jsonOutput(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

// ---- 兼容旧 API：output 对象 ----

export const output = {
  ok: (msg: string) => ok(msg),
  error: (msg: string) => error(msg),
  warn: (msg: string) => warn(msg),
  info: (msg: string) => info(msg),
  title: (msg: string) => title(msg),
  divider: () => divider(),
  kv: (key: string, value: string | number) => kv(key, String(value)),
  blank: () => console.log(),
  progress: (label: string, percentage: number) => {
    const bar = progressBar(percentage);
    console.log(`  ${label.padEnd(20)} ${bar}`);
  },
  json: (data: unknown) => jsonOutput(data),
};
