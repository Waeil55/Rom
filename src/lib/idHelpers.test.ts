import { describe, it, expect } from 'vitest'
import { isLocalId } from './localMeds'
import { isDbId } from './dbMedicines'
import { isLibraryId } from './medicineLibrary'

describe('id prefix helpers', () => {
  it('isLocalId only matches local- prefixed ids', () => {
    expect(isLocalId('local-abacavir')).toBe(true)
    expect(isLocalId('db-123')).toBe(false)
    expect(isLocalId('lib-acetaminophen')).toBe(false)
  })

  it('isDbId only matches db- prefixed ids', () => {
    expect(isDbId('db-123')).toBe(true)
    expect(isDbId('local-abacavir')).toBe(false)
    expect(isDbId('lib-acetaminophen')).toBe(false)
  })

  it('isLibraryId only matches lib- prefixed ids', () => {
    expect(isLibraryId('lib-acetaminophen')).toBe(true)
    expect(isLibraryId('local-abacavir')).toBe(false)
    expect(isLibraryId('db-123')).toBe(false)
  })

  it('the three id namespaces never collide', () => {
    const id = 'lib-db-local-edge-case'
    // Only the prefix matters, so this should only ever match one namespace.
    const matches = [isLocalId(id), isDbId(id), isLibraryId(id)].filter(Boolean)
    expect(matches.length).toBe(1)
  })
})
