import { } from '../../utils'
import { delegateEvent, getParentWithClass } from '../../utils/basic'
import * as eb from '../eventbus'

export function registerCellClickListener(rowsEle: HTMLDivElement) {
  delegateEvent(rowsEle, 'click', '.iw-data-cell', (e) => {
    const ele = e.target as HTMLElement
    const currColumnName = ele.dataset.columnName!
    const currPk = getParentWithClass(ele, 'iw-data-row')!.dataset.pk!
    eb.clickCell(currPk, currColumnName)
  })
}
