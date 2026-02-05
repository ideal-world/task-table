import type { DictItemsResp, DictTreeItemProps } from '../../props'
/**
 *
 * @param allData 全部数据
 * @param no id
 * @returns 包含自身和子数据 include self and children data
 */
export function getChildrenDataIncludeSelf(allData: DictTreeItemProps[], value: string) {
  if (!allData || !allData.length)
    return
  let returnItems = [] as DictTreeItemProps[]
  const vItem = allData.find(item => item.value === value) as DictTreeItemProps
  returnItems.push(vItem)
  const childrenData = getChildrenData(allData, vItem.no)
  returnItems = returnItems.concat(childrenData)
  return returnItems
}
/**
 *
 * @param allData 全部数据
 * @param no id
 * @returns 子数据
 */
export function getChildrenData(allData: DictTreeItemProps[], no: any) {
  let result = [] as DictTreeItemProps[]
  const childrenData = allData.filter(item => item.pno === no)
  if (childrenData && childrenData.length) {
    result = result.concat(childrenData)
    childrenData.forEach((cItem) => {
      allData.filter(item => item.pno === no)
      const data = getChildrenData(allData, cItem.no)
      result = result.concat(data)
    })
  }
  return result
}
