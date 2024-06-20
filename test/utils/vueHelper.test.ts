import { describe, expect, it } from 'vitest'
import { reactive, ref } from 'vue'
import { deepToRaw } from '../../src/utils/vueHelper'

describe('deepToRaw', () => {
  it('should convert Vue reference objects to original objects', () => {
    const reactiveObj = reactive({ age: 20, name: 'John' })
    const refObj = ref({ age: 21, name: 'Doe' })
    const array = [reactiveObj, refObj]
    const result = deepToRaw(array)
    expect(result).toEqual([
      { age: 20, name: 'John' },
      { age: 21, name: 'Doe' },
    ])
  })

  it('should return the same object for non-Vue reference objects', () => {
    const array = [{ age: 20, name: 'John' }, { age: 21, name: 'Doe' }]
    const result = deepToRaw(array)
    expect(result).toEqual(array)
  })

  it('should handle nested Vue reference objects', () => {
    const reactiveObj = reactive({ age: 20, name: 'John', child: ref({ age: 10, name: 'Jane' }) })
    const result = deepToRaw(reactiveObj)
    expect(result).toEqual({ age: 20, name: 'John', child: { age: 10, name: 'Jane' } })
  })
})
