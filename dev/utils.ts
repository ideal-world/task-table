const defaultFieldOption = {
  pno: 'pno',
  no: 'no'
}
export function getTreeParentData(
  allData: any[] = [],
  filterData: any[] = [],
  fieldOption = defaultFieldOption
) {
  const result: any[] = []
  filterData.forEach((item) => {
    const findItem = allData.find(
      (s) => s[fieldOption.no] === item[fieldOption.pno]
    )
    /** filterData里有数据就不再添加
     * 
     * filterData has data then don’t add
    */
    if (findItem && !filterData.some(e=> e.value === findItem.value)) {
      result.push(findItem)
      if (findItem[fieldOption.pno]) {
        const pollItem = getTreeParentData(allData, [findItem], fieldOption)
        pollItem && result.push(...pollItem)
      }
    }
  })
  return result
}
