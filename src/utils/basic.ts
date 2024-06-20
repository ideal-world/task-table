/**
 * 数组对象分组
 *
 * Group an array of objects by a key
 *
 * @param array 要分组的对象 / Array of objects to be grouped
 * @param predicate 分组的键 / Key to group by
 * @returns 分组后的对象 / Grouped objects
 */
export function groupBy<T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) {
  return array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value)
    return acc
  }, {} as { [key: string]: T[] })
}

/**
 * 获取父元素
 *
 * Get parent element
 *
 * @param element 当前元素 / Current element
 * @param parentClassName 父元素的类名 / Parent element class name
 * @returns 父元素 / Parent element
 */
export function getParentWithClass(element: HTMLElement | null, parentClassName: string): HTMLElement | null {
  while (element) {
    if (element.classList && element.classList.contains(parentClassName)) {
      return element
    }
    element = element.parentElement
  }
  return null
}

/**
 * 获取随机整数
 *
 * Get a random integer
 *
 * @param min 最小值 / Minimum value
 * @param max 最大值 / Maximum value
 * @returns 随机整数 / Random integer
 */
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 获取随机字符串
 *
 * Get a random string
 *
 * @param length 长度 / Length
 * @param characters 字符集 / Characters
 * @returns 随机字符串 / Random string
 */
export function getRandomString(length: number, characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = ''
  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * characters.length))

  return result
}

/**
 * 代理事件
 *
 * Delegate event
 *
 * @param parentSelectorOrEle 父元素选择器或元素 / Parent element selector or element
 * @param eventType 事件类型 / Event type
 * @param childSelector 子元素选择器 / Child element selector
 * @param handler 处理函数 / Handler
 */
export function delegateEvent(parentSelectorOrEle: string | Element, eventType: string, childSelector: string, handler: (event: Event) => void): void {
  const parentElement = parentSelectorOrEle instanceof Element ? parentSelectorOrEle : document.querySelector(parentSelectorOrEle)
  if (parentElement) {
    parentElement.addEventListener(eventType, (event) => {
      const targetElement = (event.target as Element).closest(childSelector)
      if (targetElement && parentElement.contains(targetElement)) {
        handler.call(targetElement, event)
      }
    })
  }
}
