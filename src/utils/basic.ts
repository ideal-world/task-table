export const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) =>
  array.reduce((acc, value, index, array) => {
    ; (acc[predicate(value, index, array)] ||= []).push(value)
    return acc
  }, {} as { [key: string]: T[] })

export const hasParentWithClass = (element: HTMLElement | null, className: string): boolean => {
  return getParentWithClass(element, className) != null
}

export const getParentWithClass = (element: HTMLElement | null, className: string): HTMLElement | null => {
  while (element) {
    if (element.classList && element.classList.contains(className)) {
      return element
    }
    element = element.parentElement
  }
  return null
}

export const getChildIndex = (parent: HTMLElement, child: HTMLElement): number => {
  return Array.prototype.indexOf.call(parent.children, child)
}