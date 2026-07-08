// 本地数据存储层对外入口：聚合基础设施、CRUD、迁移与导入校验。
// 拆分为多个文件后，外部仍统一从 '@/utils/storage' 引用，路径保持不变。

export {
  deleteGoal,
  deleteRecord,
  exportData,
  getGoals,
  getLastBackupAt,
  getProfile,
  getRecords,
  importData,
  recordBackup,
  saveGoal,
  saveProfile,
  saveRecord,
  saveRecords,
  updateProfile,
} from './api'
export { hydrateStore, store, type CacheShape } from './core'
export { LEGACY_KEYS, STORE_KEYS } from './keys'
export { migrateLegacyData, type LegacySnapshot, type MigrationStore } from './migration'
export { mergeImport, validateImportData, type ImportPayload } from './validation'
