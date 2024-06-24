import { } from '../../utils'
import { delegateEvent, getParentWithClass } from '../../utils/basic'
import * as eb from '../eventbus'

/**
 * 注册单元格点击事件
 *
 * Register cell click event
 *
 * @param dataContainerEle 数据容器元素，所有要监听单元格的共有父元素 / Data container element, the common parent element of all cells to be listened
 */
export function registerCellClickListener(dataContainerEle: HTMLDivElement) {
  delegateEvent(dataContainerEle, 'click', '.iw-data-cell', (e) => {
    const ele = e.target as HTMLElement
    const currColumnName = ele.dataset.columnName!
    const currPk = getParentWithClass(ele, 'iw-data-row')!.dataset.pk!
    eb.clickCell(currPk, currColumnName)
  })
}
