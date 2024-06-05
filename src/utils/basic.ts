export function groupBy<T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) {
  return array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value)
    return acc
  }, {} as { [key: string]: T[] })
}

export function hasParentWithClass(element: HTMLElement | null, className: string): boolean {
  return getParentWithClass(element, className) != null
}

export function getParentWithClass(element: HTMLElement | null, className: string): HTMLElement | null {
  while (element) {
    if (element.classList && element.classList.contains(className))
      return element

    element = element.parentElement
  }
  return null
}

export function getChildIndex(parent: HTMLElement, child: HTMLElement): number {
  return Array.prototype.indexOf.call(parent.children, child)
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomString(length: number, characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = ''
  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * characters.length))

  return result
}

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
