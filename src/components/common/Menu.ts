import { getParentWithClass } from '../../utils/basic'

/**
 * 上下文菜单的位置偏移类型
 *
 * Position offset type of context menu
 */
export enum MenuOffsetKind {
  /**
   * 以当前附着元素的坐标作为菜单的左上坐标
   *
   * Use the coordinates of the current attached element as the upper left coordinates of the menu
   */
  LEFT_TOP,
  /**
   * 以当前附着元素的坐标作为菜单的中上坐标
   *
   * Use the coordinates of the current attached element as the middle upper coordinates of the menu
   */
  MEDIUM_TOP,
  /**
   * 以当前附着元素的坐标作为菜单的右上坐标
   *
   * Use the coordinates of the current attached element as the upper right coordinates of the menu
   */
  RIGHT_TOP,
  /**
   * 以当前附着元素的坐标作为菜单的左下坐标
   *
   * Use the coordinates of the current attached element as the lower left coordinates of the menu
   */
  LEFT_BOTTOM,
  /**
   * 以当前附着元素的坐标作为菜单的中下坐标
   *
   * Use the coordinates of the current attached element as the middle lower coordinates of the menu
   */
  MEDIUM_BOTTOM,
  /**
   * 以当前附着元素的坐标作为菜单的右下坐标
   *
   * Use the coordinates of the current attached element as the lower right coordinates of the menu
   */
  RIGHT_BOTTOM,
}

// 菜单位置偏移量
// Menu position offset
const DIFF_OFFSET = 10

/**
 * 根据附着对象、位置偏移、菜单实际、边界元素大小计算初始化偏移
 *
 * Calculate the initial offset based on the size of the attachment object, position offset, menu actual, and boundary element size
 *
 * @param attachObj 菜单附着对象，可以是 MouseEvent 或 HTMLElement / Menu attachment object, can be MouseEvent or HTMLElement
 * @param offset 菜单显示位置 / Menu display position
 * @param contextMenuEle 上下文菜单元素 / Context menu element
 * @param boundaryEle 边界元素，菜单不会超出边界元素 / Boundary element, the menu will not exceed the boundary element
 */
export function getInitOffset(attachObj: HTMLElement | MouseEvent, offset: MenuOffsetKind, contextMenuEle: HTMLElement, boundaryEle?: HTMLElement) {
  let left
  let top
  let attachObjHeight
  let attachObjWidth
  if (attachObj instanceof HTMLElement) {
    const targetOffset = attachObj.getBoundingClientRect()
    left = targetOffset.left
    top = targetOffset.top
    attachObjHeight = targetOffset.height
    attachObjWidth = targetOffset.width
  }
  else {
    left = attachObj.x
    top = attachObj.y
    attachObjHeight = 0
    attachObjWidth = 0
  }
  const menuHeight = contextMenuEle.offsetHeight
  const menuWidth = contextMenuEle.offsetWidth

  // 根据不同的位置偏移计算菜单的位置
  // Calculate the position of the menu according to different position offsets
  switch (offset) {
    case MenuOffsetKind.LEFT_TOP: {
      top = top + attachObjHeight + DIFF_OFFSET
      break
    }
    case MenuOffsetKind.MEDIUM_TOP: {
      left = left + attachObjWidth / 2 - menuWidth / 2
      top = top + attachObjHeight + DIFF_OFFSET
      break
    }
    case MenuOffsetKind.RIGHT_TOP: {
      left = left + attachObjWidth - menuWidth
      top = top + attachObjHeight + DIFF_OFFSET
      break
    }
    case MenuOffsetKind.LEFT_BOTTOM: {
      top = top - menuHeight - DIFF_OFFSET
      break
    }
    case MenuOffsetKind.MEDIUM_BOTTOM: {
      left = left + attachObjWidth / 2 - menuWidth / 2
      top = top - menuHeight - DIFF_OFFSET
      break
    }
    case MenuOffsetKind.RIGHT_BOTTOM: {
      left = left + attachObjWidth - menuWidth
      top = top - menuHeight - DIFF_OFFSET
      break
    }
  }

  // 根据边界元素修正菜单的位置
  // Correct the position of the menu according to the boundary element
  if (boundaryEle) {
    const boundaryEleRect = boundaryEle.getBoundingClientRect()
    if (left < boundaryEleRect.left) {
      left = boundaryEleRect.left
    }
    if (top < boundaryEleRect.top) {
      top = boundaryEleRect.top
    }
    if ((left + contextMenuEle.offsetWidth) > boundaryEleRect.right) {
      left = boundaryEleRect.right - contextMenuEle.offsetWidth
    }

    if ((top + contextMenuEle.offsetHeight) > boundaryEleRect.bottom) {
      top = boundaryEleRect.bottom - contextMenuEle.offsetHeight
    }
  }

  return { left, top }
}

/**
 * 上下文菜单的大小类型
 *
 * Size type of context menu
 */
export enum MenuSizeKind {
  MINI,
  SMALL,
  MEDIUM,
  LARGE,
}

/**
 * 根据大小类型获取初始化大小
 *
 * Get the initialization size according to the size type
 *
 * @param size 大小类型 / Size type
 */
export function getInitSize(size: MenuSizeKind | MenuCustomSize) {
  let minHeight
  let minWidth
  let padding = 0
  switch (size) {
    case MenuSizeKind.MINI: {
      minHeight = 20
      minWidth = 40
      padding = 1
      break
    }
    case MenuSizeKind.SMALL: {
      minHeight = 40
      minWidth = 80
      padding = 2
      break
    }
    case MenuSizeKind.MEDIUM: {
      minHeight = 80
      minWidth = 160
      padding = 3
      break
    }
    case MenuSizeKind.LARGE: {
      minHeight = 100
      minWidth = 220
      padding = 4
      break
    }
    default: {
      minHeight = size.height ?? 80
      minWidth = size.width ?? 160
      padding = 3
      break
    }
  }
  return {
    minHeight,
    minWidth,
    padding,
  }
}

/**
 * 自定义上下文菜单的大小
 *
 * Custom size of context menu
 */
export interface MenuCustomSize {
  width?: number
  height?: number
}

export const EVENTS: {
  init: { [id: string]: {
    callback: (menuEle: HTMLElement) => Promise<void>
  } }
  close: { [id: string]: {
    callback: (menuEle: HTMLElement) => Promise<void>
    once: boolean
  } }
} = {
  init: {},
  close: {},
}

/**
 * 设置菜单的显示级别，用于控制有多个菜单时隐藏方式
 * Set the display level of the menu, used to control the hiding method when there are multiple menus
 *
 * @param attachObj 菜单附着对象，可以是 MouseEvent 或 HTMLElement / Menu attachment object, can be MouseEvent or HTMLElement
 * @param contextMenuEle 上下文菜单元素 / Context menu element
 */
export function setContextmenuLevel(attachObj: HTMLElement | MouseEvent, contextMenuEle: HTMLElement) {
  if (attachObj instanceof HTMLElement || attachObj.target instanceof HTMLElement) {
    const parentMenuEle = getParentWithClass(attachObj instanceof HTMLElement ? attachObj as HTMLElement : attachObj.target as HTMLElement, 'iw-contextmenu')
    if (parentMenuEle)
      // 如果有父级菜单，则在父级菜单的级别上加 1
      // If there is a parent menu, add 1 to the level of the parent menu
      contextMenuEle.dataset.level = `${Number.parseInt(parentMenuEle.dataset.level!) + 1}`
    else
      contextMenuEle.dataset.level = '0'
  }
  else {
    contextMenuEle.dataset.level = '0'
  }
}

/**
 * 隐藏不在当前事件区域内且不是当前事件对应菜单父菜单的上下文菜单
 *
 * Hide context menus that are not in the current event area and are not the parent menu of the menu corresponding to the current event
 *
 * @param event 当前事件 / Current event
 */
function hideUnActiveContextMenus(event: MouseEvent) {
  const contextmenuEles = Array.from(document.querySelectorAll('.iw-contextmenu'))
    .filter(ele => ele instanceof HTMLElement && (ele as HTMLElement).style.display !== 'none')
    .sort((a, b) => Number.parseInt((b as HTMLElement).dataset.level!) - Number.parseInt((a as HTMLElement).dataset.level!))
  contextmenuEles.forEach((contextmenuEle, idx) => {
    const contextMenuRect = contextmenuEle.getBoundingClientRect()
    if (
    // 排除当前菜单（事件源坐标在菜单区域内）
    // Exclude the current menu (the event source coordinates are in the menu area)
      event.x < contextMenuRect.left
      || event.y < contextMenuRect.top
      || event.x > contextMenuRect.left + contextMenuRect.width
      || event.y > contextMenuRect.top + contextMenuRect.height
    ) {
      if (idx === 0 || (contextmenuEles[idx - 1] as HTMLElement).style.display === 'none')
        doCloseContextMenu(contextmenuEle as HTMLElement)
    }
  })
}

/**
 * 执行关闭上下文菜单
 *
 * Execute close context menu
 *
 * @param contextMenuEle 上下文菜单元素 / Context menu element
 */
export function doCloseContextMenu(contextMenuEle: HTMLElement) {
  contextMenuEle.style.display = `none`
  const id = contextMenuEle.id
  if (id && EVENTS.close[id]) {
    EVENTS.close[id]?.callback(contextMenuEle)
    EVENTS.close[id]?.once && delete EVENTS.close[id]
  }
}

let isGlobalInit = false
function globalInit() {
  if (typeof document === 'undefined') {
    return
  }
  if (!isGlobalInit) {
    isGlobalInit = true
    /**
     * 点击时隐藏不活动的上下文菜单
     *
     * Hide inactive context menus when clicked
     */
    document.addEventListener('pointerdown', (event: MouseEvent) => {
      if (event.target === null)
        return
      hideUnActiveContextMenus(event)
    })
    /**
     * 滚动时调整上下文菜单的位置
     *
     * Adjust the position of the context menu when scrolling
     */
    window.addEventListener('scroll', () => {
      const contextmenuEles = document.querySelectorAll('.iw-contextmenu')
      for (const i in contextmenuEles) {
        if (!(contextmenuEles[i] instanceof HTMLElement) || (contextmenuEles[i] as HTMLElement).style.display === 'none') {
          continue
        }
        const contextMenuEle = contextmenuEles[i] as HTMLElement
        contextMenuEle.style.top = `${Number.parseInt(contextMenuEle.dataset.top!) - window.scrollY}px`
        contextMenuEle.style.left = `${Number.parseInt(contextMenuEle.dataset.left!) - window.scrollX}px`
      }
    })
  }
}

globalInit()
