import * as iconSvg from '../../assets/icon'
import { IwUtils } from '../../utils'
import { getParentWithClass } from '../../utils/basic'

export const NODE_DEPTH_FLAG = '__node_depth'

const EVENT_EXECUTE_HANDLER: {
  id: string
  event: (dataPk: any, hide: boolean) => Promise<void>
}[] = []

export function registerRowTreeTriggerEvent(event: (dataPk: any, hide: boolean) => Promise<void>): string {
  const id = `iw-row-tree-event-${IwUtils.getRandomString(12)}`
  EVENT_EXECUTE_HANDLER.push({
    id,
    event,
  })
  return id
}

export function unregisterRowTreeTriggerEvent(id: string) {
  const index = EVENT_EXECUTE_HANDLER.findIndex(item => item.id === id)
  if (index !== -1)
    EVENT_EXECUTE_HANDLER.splice(index, 1)
}

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
  return `${hasSubData ? `<i class="${iconSvg.SHRINK} cursor-pointer" />` : ``}`
}

export function registerTreeRowToggleListener(rowsEle: HTMLElement) {
  IwUtils.delegateEvent(rowsEle, 'click', `.${iconSvg.EXPAND}`, (e) => {
    const ele = e.target as HTMLElement
    const currPk = getParentWithClass(ele, 'iw-data-row')!.dataset.pk!
    rowsEle.querySelectorAll(`.iw-data-row[data-parent-pk="${currPk}"]`).forEach((node) => {
      (node as HTMLElement).style.display = 'flex'
      EVENT_EXECUTE_HANDLER.forEach(item => item.event((node as HTMLElement).dataset.pk, false))
    })
    ele.classList.remove(iconSvg.EXPAND)
    ele.classList.add(iconSvg.SHRINK)
    e.stopImmediatePropagation()
  })
  IwUtils.delegateEvent(rowsEle, 'click', `.${iconSvg.SHRINK}`, (e) => {
    const ele = e.target as HTMLElement
    const currPk = getParentWithClass(ele, 'iw-data-row')!.dataset.pk!
    recursionShrinkRows(rowsEle, currPk)
    ele.classList.remove(iconSvg.SHRINK)
    ele.classList.add(iconSvg.EXPAND)
    EVENT_EXECUTE_HANDLER.forEach(item => item.event(currPk, false))
    e.stopImmediatePropagation()
  })

  function recursionShrinkRows(rowsEle: HTMLElement, currPk: any) {
    rowsEle.querySelectorAll(`.iw-data-row[data-parent-pk="${currPk}"]`).forEach((node) => {
      const shrinkEle = (node as HTMLElement).querySelector(`.${iconSvg.SHRINK}`)
      if (shrinkEle) {
        shrinkEle.classList.remove(iconSvg.SHRINK)
        shrinkEle.classList.add(iconSvg.EXPAND)
      }
      (node as HTMLElement).style.display = 'none'
      EVENT_EXECUTE_HANDLER.forEach(item => item.event((node as HTMLElement).dataset.pk, true))
      recursionShrinkRows(rowsEle, (node as HTMLElement).dataset.pk)
    })
  }
}
