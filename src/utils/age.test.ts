import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import type { UserProfile } from '../types'
import { getAgeFromBirthDate, getProfileAge, hasBirthDateMigrationNeeded } from './age'

describe('age utility', () => {
  describe('getAgeFromBirthDate', () => {
    it('should calculate age correctly', () => {
      const thirtyYearsAgo = dayjs().subtract(30, 'year').format('YYYY-MM-DD')
      expect(getAgeFromBirthDate(thirtyYearsAgo)).toBe(30)
    })

    it('should calculate age correctly before birthday', () => {
      const almostThirty = dayjs().subtract(30, 'year').add(1, 'day').format('YYYY-MM-DD')
      expect(getAgeFromBirthDate(almostThirty)).toBe(29)
    })
  })

  describe('getProfileAge', () => {
    it('should prefer birthDate if available', () => {
      const profile: UserProfile = {
        gender: 'male',
        height: 175,
        age: 25, // Incorrect legacy age
        birthDate: dayjs().subtract(30, 'year').format('YYYY-MM-DD'),
        initialWeight: 70,
        createdAt: '2023-01-01T00:00:00Z',
      }
      expect(getProfileAge(profile)).toBe(30)
    })

    it('should fallback to age if birthDate is missing', () => {
      const profile: UserProfile = {
        gender: 'male',
        height: 175,
        age: 25,
        initialWeight: 70,
        createdAt: '2023-01-01T00:00:00Z',
      }
      expect(getProfileAge(profile)).toBe(25)
    })

    it('should return undefined if both are missing', () => {
      const profile: UserProfile = {
        gender: 'male',
        height: 175,
        initialWeight: 70,
        createdAt: '2023-01-01T00:00:00Z',
      }
      expect(getProfileAge(profile)).toBeUndefined()
    })
  })

  describe('hasBirthDateMigrationNeeded', () => {
    it('should return true if only age is present', () => {
      const profile: UserProfile = {
        gender: 'male',
        height: 175,
        age: 25,
        initialWeight: 70,
        createdAt: '2023-01-01T00:00:00Z',
      }
      expect(hasBirthDateMigrationNeeded(profile)).toBe(true)
    })

    it('should return false if birthDate is present', () => {
      const profile: UserProfile = {
        gender: 'male',
        height: 175,
        age: 25,
        birthDate: '1990-01-01',
        initialWeight: 70,
        createdAt: '2023-01-01T00:00:00Z',
      }
      expect(hasBirthDateMigrationNeeded(profile)).toBe(false)
    })

    it('should return false if neither is present', () => {
      const profile: UserProfile = {
        gender: 'male',
        height: 175,
        initialWeight: 70,
        createdAt: '2023-01-01T00:00:00Z',
      }
      expect(hasBirthDateMigrationNeeded(profile)).toBe(false)
    })
  })
})
