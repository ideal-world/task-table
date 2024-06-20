import {
  isProxy,
  isReactive,
  isRef,
  toRaw,
} from 'vue'

/**
 * 深度转换Vue引用对象到原始对象
 *
 * Deeply convert Vue reference objects to original objects
 *
 * https://github.com/vuejs/core/issues/5303
 *
 * @param sourceObj Vue的引用对象 / Vue reference object
 * @returns 原始对象 / Original object
 */
export function deepToRaw<T extends Record<string, any>>(sourceObj: T): T {
  const objectIterator = (input: any): any => {
    if (Array.isArray(input)) {
      return input.map(item => objectIterator(item))
    } if (isRef(input)) {
      return objectIterator(toRaw(input.value))
    } if (isReactive(input) || isProxy(input)) {
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
