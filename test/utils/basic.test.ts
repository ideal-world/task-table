import { assert, describe, expect, it } from 'vitest'
import { groupBy } from '../../src/utils/basic'

describe('groupBy', () => {
  it('should group objects by a key', () => {
    const array = [
      { age: 20, name: 'John' },
      { age: 20, name: 'Jane' },
      { age: 21, name: 'Doe' },
    ]
    const result = groupBy(array, item => item.age.toString())
    expect(result).toEqual({
      20: [
        { age: 20, name: 'John' },
        { age: 20, name: 'Jane' },
      ],
      21: [
        { age: 21, name: 'Doe' },
      ],
    })
  })

  it('should return an empty object for an empty array', () => {
    const array: any[] = []
    const result = groupBy(array, item => item.age.toString())
    expect(result).toEqual({})
  })

  it('should group objects by a key even if the key is not present in all objects', () => {
    const array = [
      { age: 20, name: 'John' },
      { name: 'Jane' },
      { age: 21, name: 'Doe' },
    ]
    const result = groupBy(array, item => item.age ? item.age.toString() : 'unknown')
    expect(result).toEqual({
      20: [
        { age: 20, name: 'John' },
      ],
      21: [
        { age: 21, name: 'Doe' },
      ],
      unknown: [
        { name: 'Jane' },
      ],
    })
  })
})
