export const NODE_DEPTH_FLAG = '__node_depth'

export function sortByTree(data: any[], pkColumnName: string, parentPkColumnName?: string) {
  if (parentPkColumnName === undefined)
    return data

  return getTreeData(data, undefined, pkColumnName, parentPkColumnName, 0)
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
