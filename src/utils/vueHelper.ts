import {
  isProxy,
  isReactive,
  isRef,
  toRaw,
} from 'vue'

/// deepToRaw
///
/**
 * DeepToRaw
 *
 * https://github.com/vuejs/core/issues/5303
 * @param sourceObj Objects that may contain reactive
 * @returns Objects that do not contain reactive
 */
export function deepToRaw<T extends Record<string, any>>(sourceObj: T): T {
  const objectIterator = (input: any): any => {
    if (Array.isArray(input)) {
      return input.map(item => objectIterator(item))
    } if (isRef(input) || isReactive(input) || isProxy(input)) {
      return objectIterator(toRaw(input))
    } if (input && typeof input === 'object') {
      return Object.keys(input).reduce((acc, key) => {
        acc[key as keyof typeof acc] = objectIterator(input[key])
        return acc
      }, {} as T)
    }
    return input
  }

  return objectIterator(sourceObj)
}
