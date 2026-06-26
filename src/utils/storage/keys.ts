// 旧版本使用的 localStorage key（迁移来源，迁移后保留为只读备份）
export const LEGACY_KEYS = {
  profile: 'scaletrack_profile',
  records: 'scaletrack_records',
  goals: 'scaletrack_goals',
} as const

// IndexedDB 内的 key
export const STORE_KEYS = {
  profile: 'profile',
  records: 'records',
  goals: 'goals',
  lastBackupAt: 'lastBackupAt',
  migrated: '__migrated_from_localstorage',
} as const
