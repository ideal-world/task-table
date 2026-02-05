import { delegateEvent, getParentWithClass } from '../../../utils/basic'

/**
 *
 * @param treeEl
 * 监听展开、收起
 */
export function registerTreeArrowToggleListener(treeEl: HTMLElement) {
  // 监听收起的行，点击时展开
  // Listen to the expanded row, click to collapse
  delegateEvent(treeEl, 'click', `.icon-tree-arrow`, (e) => {
    const ele = e.target as HTMLElement
    // ele.classList.toggle('-rotate-90')
    // 当前行的主键
    // Primary key of the current row
    const currPk = getParentWithClass(ele, 'iw-contextmenu__item')!.dataset.pk!
    if (hasClass(ele, '-rotate-90')) {
      ele.classList.remove('-rotate-90')
    }
    else {
      ele.classList.add('-rotate-90')
      recursionShrinkRows(treeEl, currPk)
      return
    }
    treeEl
      .querySelectorAll(`.iw-contextmenu__item[data-parent-pk="${currPk}"]`)
      .forEach((node) => {
        // 显示子行
        // Display child row
        const isShow = (node as HTMLElement).style.display !== 'none'

        if (!isShow)
          (node as HTMLElement).style.display = 'flex'
      })
    e.stopImmediatePropagation()
  })
}

// 递归收缩 recursion shrink
function recursionShrinkRows(treeEl: HTMLElement, currPk: any) {
  treeEl
    .querySelectorAll(`.iw-contextmenu__item[data-parent-pk="${currPk}"]`)
    .forEach((node) => {
      ;(node as HTMLElement).style.display = 'none'
      recursionShrinkRows(treeEl, (node as HTMLElement).dataset.pk)
    })
}

function hasClass(element: HTMLElement, className: string) {
  return element.classList && element.classList.contains(className)
}

export const treeFieldOption = {
  no: 'no',
  pno: 'pno',
}

export function hasSubDataFn(data: any[]) {
  data.forEach((item: any) => {
    const isHas = data.some(
      e => e[treeFieldOption.pno] === item[treeFieldOption.no],
    )
    item.hasSub = !!isHas
  })
  return data
}
