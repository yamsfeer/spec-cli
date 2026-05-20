import fs from 'fs-extra';
import path from 'path';
import type { ChangeRecord } from '@spec-cli/shared';

/**
 * DiffTracker — 变更追踪与回滚。
 *
 * 变更文件存放在 specDir/../.spec-changes/ 目录下。
 */
export class DiffTracker {
  private specDir: string;
  private changesDir: string;
  private changesFile: string;

  constructor(specDir: string) {
    this.specDir = path.resolve(specDir);
    this.changesDir = path.join(path.dirname(this.specDir), '.spec-changes');
    this.changesFile = path.join(this.changesDir, 'changes.json');
  }

  // -------- 变更生命周期 --------

  /**
   * 开始一个新的变更。
   */
  startChange(entryId: string, description: string): ChangeRecord {
    const records = this.loadChangesSync();

    const record: ChangeRecord = {
      id: Date.now(),
      entry_id: entryId,
      description,
      status: 'pending',
      created_at: new Date().toISOString(),
      modified_entries: [],
    };

    records.push(record);
    this.saveChangesSync(records);

    return record;
  }

  /**
   * 备份文件到变更目录。
   */
  async backupFile(filePath: string): Promise<void> {
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.specDir, filePath);

    if (!(await fs.pathExists(absPath))) return;

    const relPath = path.relative(this.specDir, absPath);
    const backupPath = path.join(this.changesDir, 'backups', relPath);
    await fs.ensureDir(path.dirname(backupPath));
    await fs.copy(absPath, backupPath);
  }

  /**
   * 记录文件修改。
   */
  async recordModification(changeId: number, filePath: string): Promise<void> {
    const records = this.loadChangesSync();
    const record = records.find(r => r.id === changeId);
    if (!record) throw new Error(`变更 #${changeId} 不存在`);

    if (!record.modified_entries.includes(filePath)) {
      record.modified_entries.push(filePath);
      record.status = 'in_progress';
      // 备份当前文件
      await this.backupFile(filePath);
    }

    this.saveChangesSync(records);
  }

  /**
   * 标记变更为已应用。
   */
  applyChange(changeId: number): ChangeRecord {
    const records = this.loadChangesSync();
    const record = records.find(r => r.id === changeId);
    if (!record) throw new Error(`变更 #${changeId} 不存在`);

    record.status = 'applied';
    this.saveChangesSync(records);
    return record;
  }

  /**
   * 回滚到备份状态。
   */
  async rollback(changeId: number): Promise<void> {
    const records = this.loadChangesSync();
    const record = records.find(r => r.id === changeId);
    if (!record) throw new Error(`变更 #${changeId} 不存在`);

    for (const entryPath of record.modified_entries) {
      const backupPath = path.join(this.changesDir, 'backups', entryPath);
      const originalPath = path.join(this.specDir, entryPath);

      if (await fs.pathExists(backupPath)) {
        await fs.copy(backupPath, originalPath);
      }
    }

    record.status = 'rolled_back';
    this.saveChangesSync(records);
  }

  /**
   * 放弃变更并清理备份。
   */
  async abortChange(changeId: number): Promise<void> {
    const records = this.loadChangesSync();
    const record = records.find(r => r.id === changeId);
    if (!record) throw new Error(`变更 #${changeId} 不存在`);

    // 删除备份目录
    const backupRoot = path.join(this.changesDir, 'backups');
    if (await fs.pathExists(backupRoot)) {
      await fs.remove(backupRoot);
    }

    // 移除记录
    const idx = records.indexOf(record);
    if (idx >= 0) {
      records.splice(idx, 1);
    }
    this.saveChangesSync(records);
  }

  // -------- 查询 --------

  getPendingChanges(): ChangeRecord[] {
    const records = this.loadChangesSync();
    return records.filter(r => r.status === 'pending' || r.status === 'in_progress');
  }

  getChangeReport(changeId: number): string {
    const records = this.loadChangesSync();
    const record = records.find(r => r.id === changeId);
    if (!record) return `变更 #${changeId} 不存在`;

    const lines = [
      `Change #${record.id} Summary:`,
      `  描述: ${record.description}`,
      `  目标条目: ${record.entry_id}`,
      `  状态: ${record.status}`,
      `  修改文件 (${record.modified_entries.length}):`,
    ];

    for (const f of record.modified_entries) {
      lines.push(`    ${f}`);
    }

    return lines.join('\n');
  }

  // -------- 内部方法 --------

  private loadChangesSync(): ChangeRecord[] {
    if (fs.pathExistsSync(this.changesFile)) {
      try {
        return fs.readJsonSync(this.changesFile) as ChangeRecord[];
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveChangesSync(records: ChangeRecord[]): void {
    fs.ensureDirSync(this.changesDir);
    fs.writeJsonSync(this.changesFile, records, { spaces: 2 });
  }
}
