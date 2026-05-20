// ============================================================
// Spec CLI — 日志工具
// ============================================================

import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

let logLevel: LogLevel = 'info';

export function setLogLevel(level: LogLevel): void {
  logLevel = level;
}

export function getLogLevel(): LogLevel {
  return logLevel;
}

const LEVEL_RANKS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_RANKS[level] >= LEVEL_RANKS[logLevel];
}

export function debug(message: string, ...args: unknown[]): void {
  if (shouldLog('debug')) {
    console.log(`${chalk.gray('[DEBUG]')} ${message}`, ...args);
  }
}

export function logInfo(message: string, ...args: unknown[]): void {
  if (shouldLog('info')) {
    console.log(`${chalk.blue('[INFO]')} ${message}`, ...args);
  }
}

export function logWarn(message: string, ...args: unknown[]): void {
  if (shouldLog('warn')) {
    console.log(`${chalk.yellow('[WARN]')} ${message}`, ...args);
  }
}

export function logError(message: string, ...args: unknown[]): void {
  if (shouldLog('error')) {
    console.log(`${chalk.red('[ERROR]')} ${message}`, ...args);
  }
}
