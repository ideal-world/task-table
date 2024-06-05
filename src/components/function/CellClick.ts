import * as eb from '../eventbus'
import { IwUtils } from '../../utils'
import { getParentWithClass } from '../../utils/basic'

export function registerCellClickListener(rowsEle: HTMLDivElement) {
  IwUtils.delegateEvent(rowsEle, 'click', '.iw-list-data-cell', (e) => {
    const ele = e.target as HTMLElement
    const currColumnName = ele.dataset.columnName!
    const currPk = getParentWithClass(ele, 'iw-list-data-row')!.dataset.pk!
    eb.clickCell(currPk, currColumnName)
  })
}
