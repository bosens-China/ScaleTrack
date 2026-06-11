import dayjs from 'dayjs'
import type { UserProfile } from '../types'

/**
 * 从出生日期计算当前周岁
 * @param birthDate 出生日期 (YYYY-MM-DD)
 * @returns 年龄 (整数)
 */
export function getAgeFromBirthDate(birthDate: string): number {
  return dayjs().diff(dayjs(birthDate), 'year')
}

/**
 * 获取用户的年龄
 * 优先使用 birthDate 动态计算，若没有则回退到过往存储的静态 age 字段。
 * @param profile 用户配置
 * @returns 年龄，若都缺失则返回 undefined
 */
export function getProfileAge(profile: UserProfile): number | undefined {
  if (profile.birthDate) {
    return getAgeFromBirthDate(profile.birthDate)
  }
  return profile.age
}

/**
 * 检查当前用户是否需要进行生日字段的迁移提示
 * @param profile 用户配置
 * @returns true: 需要提示 (有 age 但无 birthDate)
 */
export function hasBirthDateMigrationNeeded(profile: UserProfile): boolean {
  return profile.age !== undefined && profile.birthDate === undefined
}
