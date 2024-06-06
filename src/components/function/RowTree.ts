import * as iconSvg from '../../assets/icon'
import { IwUtils } from '../../utils'
import { getParentWithClass } from '../../utils/basic'

export const NODE_DEPTH_FLAG = '__node_depth'

export function sortByTree(data: any[], pkColumnName: string, parentPkColumnName?: string) {
  if (parentPkColumnName === undefined)
    return data

  return getTreeData(data, null, pkColumnName, parentPkColumnName, 0)
}

function getTreeData(data: any[], parentPk: any, pkColumnName: string, parentPkColumnName: string, depth: number): any[] {
  const treeData = []
  const nodeData = data.filter(item => item[parentPkColumnName] === parentPk)
  for (const node of nodeData) {
    node[NODE_DEPTH_FLAG] = depth
    treeData.push(node)
    const children = getTreeData(data, node[pkColumnName], pkColumnName, parentPkColumnName, depth + 1)
    if (children.length > 0)
      treeData.push(...children)
  }
  return treeData
}

export function filterTreeDataPks(filterPks: any[], records: { [key: string]: any }[], pkColumnName: string, parentPkColumnName?: string): any[] {
  if (parentPkColumnName === undefined)
    return filterPks

  const pksWithChildren: any[] = filterPks.slice()

  pksWithChildren.forEach((pk) => {
    const childrenPks = records.filter(record => record[parentPkColumnName!] === pk).map(record => record[pkColumnName])
    if (childrenPks.length > 0) {
      pksWithChildren.push(...childrenPks)
      pksWithChildren.push(...filterTreeDataPks(childrenPks, records, pkColumnName, parentPkColumnName))
    }
  })
  return pksWithChildren
}

export function renderTreeToggleHandler(hasSubData: boolean): string {
  return `${hasSubData ? `<i class="${iconSvg.EXPAND} cursor-pointer" />` : ``}`
}

export function registerTreeRowToggleListener(rowsEle: HTMLDivElement) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.type === 'childList' && mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.classList.contains('iw-list-data-fold') && node.dataset.parentPk !== undefined) {
          node.style.display = 'none'
        }
      })
    })
  })
  observer.observe(rowsEle, { childList: true, subtree: true })

  IwUtils.delegateEvent(rowsEle, 'click', `.${iconSvg.EXPAND}`, (e) => {
    const ele = e.target as HTMLElement
    const currPk = getParentWithClass(ele, 'iw-list-data-row')!.dataset.pk!
    rowsEle.querySelectorAll(`.iw-list-data-row[data-parent-pk="${currPk}"]`).forEach((node) => {
      (node as HTMLElement).style.display = 'flex'
    })
    ele.classList.remove(iconSvg.EXPAND)
    ele.classList.add(iconSvg.SHRINK)
    e.stopImmediatePropagation()
  })
  IwUtils.delegateEvent(rowsEle, 'click', `.${iconSvg.SHRINK}`, (e) => {
    const ele = e.target as HTMLElement
    const currPk = getParentWithClass(ele, 'iw-list-data-row')!.dataset.pk!
    recursionShrinkRows(rowsEle, currPk)
    ele.classList.remove(iconSvg.SHRINK)
    ele.classList.add(iconSvg.EXPAND)
    e.stopImmediatePropagation()
  })

  function recursionShrinkRows(rowsEle: HTMLElement, currPk: any) {
    rowsEle.querySelectorAll(`.iw-list-data-row[data-parent-pk="${currPk}"]`).forEach((node) => {
      const shrinkEle = (node as HTMLElement).querySelector(`.${iconSvg.SHRINK}`)
      if (shrinkEle) {
        shrinkEle.classList.remove(iconSvg.SHRINK)
        shrinkEle.classList.add(iconSvg.EXPAND)
      }
      (node as HTMLElement).style.display = 'none'
      recursionShrinkRows(rowsEle, (node as HTMLElement).dataset.pk)
    })
  }
}
