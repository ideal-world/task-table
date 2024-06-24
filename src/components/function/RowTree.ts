import * as iconSvg from '../../assets/icon'
import { delegateEvent, getParentWithClass, getRandomString } from '../../utils/basic'

/**
 * 节点深度标识，用于树型数据的缩进显示
 *
 * Node depth flag, used for indented display of tree data
 */
export const NODE_DEPTH_FLAG = '__node_depth'

const EVENT_EXECUTE_HANDLER: {
  id: string
  event: (dataPk: any, hide: boolean) => Promise<void>
}[] = []

/**
 * 注册树型数据行的显示/隐藏事件
 *
 * Register the show/hide event of the tree data row
 *
 * @param event 触发事件
 * @returns 事件ID
 */
export function registerRowTreeTriggerEvent(event: (dataPk: any, hide: boolean) => Promise<void>): string {
  const id = `iw-row-tree-event-${getRandomString(12)}`
  EVENT_EXECUTE_HANDLER.push({
    id,
    event,
  })
  return id
}

/**
 * 注销树型数据行的显示/隐藏事件
 *
 * Unregister the show/hide event of the tree data row
 *
 * @param id 事件ID
 */
export function unregisterRowTreeTriggerEvent(id: string) {
  const index = EVENT_EXECUTE_HANDLER.findIndex(item => item.id === id)
  if (index !== -1)
    EVENT_EXECUTE_HANDLER.splice(index, 1)
}

/**
 * 根据树型数据排序
 *
 * Sort by tree data
 *
 * 将子数据排在父数据后面。
 *
 * Put the child data after the parent data.
 *
 * @param data 数据
 * @param pkColumnName 主键列名
 * @param parentPkColumnName 父主键列名
 * @returns 排序后的数据
 */
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

/**
 * 按行渲染树型数据行的展开/收起按钮
 *
 * Render the expand/collapse button of the tree data row by row
 *
 * @param hasSubData 是否有子数据 / Whether there is sub data
 * @returns 按钮HTML / Button HTML
 */
export function renderTreeToggleHandler(hasSubData: boolean): string {
  return `${hasSubData ? `<i class="${iconSvg.SHRINK} cursor-pointer" />` : ``}`
}

/**
 * 注册树型数据行的展开/收起事件监听
 *
 * Register the expand/collapse event listener of the tree data row
 *
 * @param rowsEle 行元素 / Row element
 */
export function registerTreeRowToggleListener(rowsEle: HTMLElement) {
  // 监听收起的行，点击时展开
  // Listen to the expanded row, click to collapse
  delegateEvent(rowsEle, 'click', `.${iconSvg.EXPAND}`, (e) => {
    const ele = e.target as HTMLElement
    // 当前行的主键
    // Primary key of the current row
    const currPk = getParentWithClass(ele, 'iw-data-row')!.dataset.pk!
    rowsEle.querySelectorAll(`.iw-data-row[data-parent-pk="${currPk}"]`).forEach((node) => {
      // 显示子行
      // Display child row
      (node as HTMLElement).style.display = 'flex'
      // 触发展开事件
      // Trigger expand event
      EVENT_EXECUTE_HANDLER.forEach(item => item.event((node as HTMLElement).dataset.pk, false))
    })
    // 切换图标
    // Switch icon
    ele.classList.remove(iconSvg.EXPAND)
    ele.classList.add(iconSvg.SHRINK)
    e.stopImmediatePropagation()
  })
  // 监听展开的行，点击时收起
  // Listen to the expanded row, click to collapse
  delegateEvent(rowsEle, 'click', `.${iconSvg.SHRINK}`, (e) => {
    const ele = e.target as HTMLElement
    // 当前行的主键
    // Primary key of the current row
    const currPk = getParentWithClass(ele, 'iw-data-row')!.dataset.pk!
    // 递归收起子行（可能有多个层级需要收起）
    // Recursively collapse child rows (may have multiple levels to collapse)
    recursionShrinkRows(rowsEle, currPk)
    // 切换图标
    // Switch icon
    ele.classList.remove(iconSvg.SHRINK)
    ele.classList.add(iconSvg.EXPAND)
    // 触发收起事件
    // Trigger collapse event
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
