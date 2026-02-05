import { delegateEvent, getParentWithClass } from '../../utils/basic'
import * as eb from '../eventbus'
import { DragRowPosition } from '../../props'

/**
 * 注册数据行的拖拽事件
 *
 * @param event 触发事件
 */
export function registerRowDragEvent(dataContainerEle: HTMLDivElement) {
  let draggedRowPk: string = ''
  const removeClass = (ele: HTMLElement) => {
    ele.classList.remove('drag-over-up')
    ele.classList.remove('drag-over-down')
    ele.classList.remove('drag-over-middle')
  }
  const getParentEle = (e: Event) => {
    const ele = e.target as HTMLElement
    return getParentWithClass(ele, 'iw-data-row')
  }

  delegateEvent(dataContainerEle, 'dragstart', '.iw-data-row', (e) => {
    const event = e as MouseEvent & { dataTransfer: DataTransfer }
    event.dataTransfer.effectAllowed = 'move'
    const ele = getParentEle(e)
    ele!.classList.add('dragging')
    draggedRowPk = ele!.dataset.pk!
  })
  delegateEvent(dataContainerEle, 'dragover', '.iw-data-row', (e) => {
    e.preventDefault()
    const event = e as MouseEvent & { dataTransfer: DataTransfer }
    event.dataTransfer.dropEffect = 'move'
    const ele = getParentEle(e)
    removeClass(ele as HTMLElement)
    if (!ele)
      return
    const currPk = ele!.dataset.pk!
    if (currPk === draggedRowPk)
      return
    const rect = ele.getBoundingClientRect()
    const y = rect.top + rect.height / 2
    const step = rect.height / 6
    let position: DragRowPosition = DragRowPosition.BEFORE
    let className = ''
    if (event.clientY > y - step && event.clientY < y + step) {
      position = DragRowPosition.INSIDE
      className = 'drag-over-middle'
    }
    else if (event.clientY < y) {
      position = DragRowPosition.BEFORE
      className = 'drag-over-up'
    }
    else {
      position = DragRowPosition.AFTER
      className = 'drag-over-down'
    }
    if (!eb.dragoverDataRow(draggedRowPk, currPk, position)) {
      event.dataTransfer.dropEffect = 'none'
      return
    }

    ele.classList.add(className)
  })
  delegateEvent(dataContainerEle, 'dragleave', '.iw-data-row', (e) => {
    const ele = getParentEle(e)
    if (ele) {
      removeClass(ele)
    }
  })
  delegateEvent(dataContainerEle, 'drop', '.iw-data-row', (e) => {
    const ele = getParentEle(e)
    const currPk = ele!.dataset.pk!
    if (currPk === draggedRowPk)
      return
    if (ele?.classList.contains('drag-over-up')) {
      eb.dropDataRow(draggedRowPk, currPk, DragRowPosition.BEFORE)
    }
    else if (ele?.classList.contains('drag-over-down')) {
      eb.dropDataRow(draggedRowPk, currPk, DragRowPosition.AFTER)
    }
    else if (ele?.classList.contains('drag-over-middle')) {
      eb.dropDataRow(draggedRowPk, currPk, DragRowPosition.INSIDE)
    }
  })
  delegateEvent(dataContainerEle, 'dragend', '.iw-data-row', (e) => {
    const ele = getParentEle(e)
    ele!.classList.remove('dragging')
    dataContainerEle.querySelectorAll('.iw-data-row').forEach((ele) => {
      removeClass(ele as HTMLElement)
    })
  })
}
