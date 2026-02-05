import dayjs from 'dayjs'

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
 * 获取具有指定类名前缀的子元素的宽度
 *
 * Get the width of child elements
 *
 */
export function getChildrenWidth(element: Element | null, prefix?: string): number {
  if (!element)
    return 0
  let width = 0
  if (!element.children.length)
    return 0
  const children = prefix ? element.querySelectorAll(`[class*="${prefix}"]`) : element.children
  for (const child of Array.from(children)) {
    const style = window.getComputedStyle(child as HTMLElement)
    const childWidth = Number.parseFloat(style.width) || 0
    const marginRight = Number.parseFloat(style.marginRight) || 0
    const marginLeft = Number.parseFloat(style.marginLeft) || 0
    width += childWidth + marginRight + marginLeft
  }
  return width
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
/**
 * 创建一个防抖动函数，该函数延迟调用`func`直到等待时间`wait`结束。
 * 如果在这段时间内再次被调用，则重新计时。
 *
 * @param func 要执行的函数。
 * @param wait 等待时间，单位为毫秒。
 * @param immediate 是否在等待开始时立即调用函数。
 * @returns 返回新的防抖函数。
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false,
): (...funcArgs: Parameters<T>) => void {
  let timeout: number | null = null

  return function (...args: Parameters<T>) {
    // const context: any = this as any

    const later = function () {
      timeout = null
      if (!immediate)
        func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout)
      clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow)
      func(...args)
  }
}
/**
 * 将yyyy-MM-dd HH:mm:ss格式化成dayjs的字符匹配的YYYY-MM-DD HH:mm:ss
 */
export function formatDate(date: string) {
  return date.replace(/[yd]/g, match => match.toUpperCase())
}
/**
 * 将YYYY-MM-DD HH:mm:ss转为YYYY-MM-DDTHH:mm:ss.000z
 */
export function formatDateToUTC(date: string) {
  if (dayjs(date).isValid()) {
    return dayjs(date).toISOString()
  }
  return date
}

/**
 *
 * 获取字典title
 *
 * Get dict title
 *
 * @param list 行数据  Row data
 */
export function dictionaryTxt(list: any[]) {
  if (!list?.length)
    return { txt: '', htmlStr: '' }
  let txt = ''
  list.forEach((item: { [columnName: string]: any }, index: number) => {
    txt += `${item?.title ?? ''}${index < list.length - 1 ? ',' : ''}`
  }, '')
  let htmlStr = ''
  list.forEach((item: { [columnName: string]: any }, index: number) => {
    htmlStr += `<span style="color: ${item.color}">${item?.title ?? ''}<span>${index < list.length - 1 ? ',' : ''}`
  }, '')
  return { txt, htmlStr }
}

/**
 *
 * 非空值
 *
 * is not null
 *
 * @param value 值 / Value
 */
export function isNotEmpty(value: any) {
  return value !== null && value !== undefined && !Number.isNaN(value)
}

/**
 * 设置颜色的透明度
 *
 * Set the transparency of the color
 *
 * @param color 颜色 / Color
 * @param alpha 透明度 / Alpha
 * @returns 带透明度的颜色 / Color with alpha
 */
export function setColorAlpha(color: string, alpha: number) {
  // 确保透明度在 0-1 之间
  alpha = Math.min(1, Math.max(0, alpha))

  let r, g, b

  // 处理十六进制格式（如 #RGB、#RRGGBB、#RRGGBBAA）
  if (color.startsWith('#')) {
    let hex = color.slice(1).replace(/[^0-9a-f]/gi, '') // 去除非十六进制字符

    // 扩展短格式（如 #F0A → FF00AA）
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map(c => c + c).join('')
    }

    // 解析 RGB 分量
    if (hex.length === 6 || hex.length === 8) {
      r = Number.parseInt(hex.substring(0, 2), 16)
      g = Number.parseInt(hex.substring(2, 4), 16)
      b = Number.parseInt(hex.substring(4, 6), 16)
    }
    else {
      throw new Error('Invalid hex color format')
    }

  // 处理 RGB/RGBA 格式（如 rgb(255,0,0)、rgba(255,0,0,0.5)）
  }
  else if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i)
    if (!match)
      throw new Error('Invalid RGB/RGBA format')

    r = Number.parseInt(match[1], 10)
    g = Number.parseInt(match[2], 10)
    b = Number.parseInt(match[3], 10)

  // 不支持其他格式（如颜色名称）
  }
  else {
    return color
  }

  // 返回带透明度的 RGBA 字符串
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
