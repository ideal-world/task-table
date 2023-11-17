<script setup lang="ts">
import { onMounted, provide, reactive, ref, toRaw } from 'vue'
import * as iconSvg from '../assets/icon'
import { FN_ADD_DATA, FN_DELETE_COLUMN, FN_DELETE_DATA, FN_DELETE_LAYOUT, FN_LOAD_CELL_OPTIONS_DATA, FN_LOAD_DATA, FN_MODIFY_COLUMN, FN_MODIFY_LAYOUT, FN_MODIFY_STYLES, FN_NEW_COLUMN, FN_NEW_LAYOUT, FN_SORT_LAYOUTS, FN_UPDATE_DATA } from '../constant'
import MenuComp, { MenuOffsetKind } from './common/Menu.vue'
import { TableBasicConf, TableColumnConf, TableLayoutColumnConf, TableLayoutConf, TableStyleConf, getDefaultValueByDataKind, initConf } from './conf'
import ResizeComp from './function/resize/Resize.vue'
import ThemeComp from './function/theme/Theme.vue'
import ListComp from './layout/list/List.vue'
import { OperatorKind, TableLayoutModifyReq, TableProps } from './props'

const props = defineProps<TableProps>()
const [_tableBasicConf, _tableLayoutsConf] = initConf(props)
const menuLayoutCompRef = ref()
const menuMoreCompRef = ref()

const tableLayoutsConf = reactive<TableLayoutConf[]>(_tableLayoutsConf)
const tableBasicConf = reactive<TableBasicConf>(_tableBasicConf)
const currentLayoutId = ref<string>(tableLayoutsConf[0].id)

// ------------- Common Events -------------
async function loadData(layoutId?: string, moreForGroupedValue?: any) {
  const layout = layoutId ? tableLayoutsConf.find(layout => layout.id == layoutId)! : tableLayoutsConf.find(layout => layout.id == currentLayoutId.value)!
  let filters
  if (layout.filters) {
    filters = toRaw(layout.filters)
  }
  if (moreForGroupedValue) {
    let groupFilter = {
      items: [
        {
          columnName: layout.group?.columnName as string,
          operator: OperatorKind.EQ,
          value: moreForGroupedValue
        }
      ],
      and: true
    }
    if (filters) {
      filters.push(groupFilter)
    } else {
      filters = [groupFilter]
    }
  }
  let sorts
  if (layout.sorts) {
    sorts = toRaw(layout.sorts)
  }
  let group
  if (layout.group) {
    group = toRaw(layout.group)
  }
  let aggs
  if (layout.aggs) {
    aggs = toRaw(layout.aggs)
  }
  let slice
  if (layout.slice) {
    slice = toRaw(layout.slice)
  }
  const resp = await props.events.loadData(filters, sorts, group, aggs, slice)
  if (Array.isArray(resp)) {
    // (Re)group query
    if (layout.data && Array.isArray(layout.data)) {
      layout.data.splice(0, layout.data.length, ...resp)
    } else {
      layout.data = resp
    }
  } else if (moreForGroupedValue) {
    // Single group query (E.g. to get more records of the current group)
    if (layout.data && Array.isArray(layout.data)) {
      const groupData = layout.data.find((d) => d.groupValue === moreForGroupedValue)
      if (groupData) {
        groupData.records.push(...resp.records)
        groupData.aggs = resp.aggs
        groupData.totalNumber = resp.totalNumber
      }
    } else {
      layout.data = resp
    }
  } else {
    // Query without grouping
    layout.data = resp
  }
}

async function addData(newRecords: { [key: string]: any }[], afterPkId?: number, groupValue?: any, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id == currentLayoutId.value)!
  if (props.events.saveData && (await props.events.saveData(newRecords))) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  let data
  if (groupValue && Array.isArray(layout.data)) {
    data = layout.data.find((d) => d.groupValue === groupValue)
  } else if (layout.data && !Array.isArray(layout.data)) {
    data = layout.data
  } else {
    // Empty,unreachable
  }
  if (data) {
    if (afterPkId) {
      data.records.splice(afterPkId, 0, ...newRecords)
    } else {
      data.records.splice(0, 0, ...newRecords)
    }
  }
  return true
  // TODO agg清空，重新计算
}


async function updateData(changedRecords: { [key: string]: any }[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id == currentLayoutId.value)!
  if (props.events.saveData && (await props.events.saveData(changedRecords))) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  if (Array.isArray(layout.data)) {
    layout.data.forEach(groupData => {
      groupData.records.forEach((needChangeRecord) => {
        const changedRecord = changedRecords.find((r) => r[tableBasicConf.pkColumnName] === needChangeRecord[tableBasicConf.pkColumnName])
        if (changedRecord) {
          for (const key in changedRecord) {
            needChangeRecord[key] = changedRecord[key]
          }
        }
      })
    })
  } else if (layout.data && !Array.isArray(layout.data)) {
    layout.data.records.forEach((needChangeRecord) => {
      const changedRecord = changedRecords.find((r) => r[tableBasicConf.pkColumnName] === needChangeRecord[tableBasicConf.pkColumnName])
      if (changedRecord) {
        for (const key in changedRecord) {
          needChangeRecord[key] = changedRecord[key]
        }
      }
    })
  } else {
    // Empty,unreachable
  }
  return true
  // TODO agg清空，重新计算
}

async function deleteData(deletedPks: any[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id == currentLayoutId.value)!
  if (props.events.deleteData && (await props.events.deleteData(deletedPks))) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  if (Array.isArray(layout.data)) {
    layout.data.forEach((d) => {
      d.records = d.records.filter((item) => !deletedPks.includes(item[tableBasicConf.pkColumnName]))
    })
  } else if (layout.data && !Array.isArray(layout.data)) {
    layout.data.records = layout.data.records.filter((item) => !deletedPks.includes(item[tableBasicConf.pkColumnName]))
  } else {
    // Empty,unreachable
  }
  return true
  // TODO agg清空，重新计算
}

async function loadCellOptions(columnName: string, cellValue: any): Promise<{ title: string; value: any }[]> {
  if (props.events.loadCellOptions) {
    return await props.events.loadCellOptions(columnName, cellValue)
  } else {
    return []
  }
}

async function modifyStyles(changedStyles: TableStyleConf, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id == currentLayoutId.value)!
  if (props.events.modifyStyles && (await props.events.modifyStyles({
    size: changedStyles.size,
    tableClass: changedStyles.tableClass,
    headerClass: changedStyles.headerClass,
    rowClass: changedStyles.rowClass,
    cellClass: changedStyles.cellClass,
    aggClass: changedStyles.aggClass
  }))) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  tableBasicConf.styles = changedStyles
  return true
  // TODO agg清空，重新计算
}

async function newColumn(newColumnConf: TableColumnConf, newLayoutColumnConf: TableLayoutColumnConf, fromColumnName?: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id == currentLayoutId.value)!
  if (props.events.newColumn && props.events.modifyLayout
    && await props.events.newColumn({
      name: newColumnConf.name,
      title: newColumnConf.title,
      icon: newColumnConf.icon,
      dataKind: newColumnConf.dataKind,
      dataEditable: newColumnConf.dataEditable,
    }, fromColumnName)
    && await props.events.modifyLayout({
      id: currentLayoutId.value,
      newColumn: {
        name: newLayoutColumnConf.name,
        wrap: newLayoutColumnConf.wrap,
        fixed: newLayoutColumnConf.fixed,
        width: newLayoutColumnConf.width,
        hide: newLayoutColumnConf.hide,
        dateStart: newLayoutColumnConf.dateStart,
        dateEnd: newLayoutColumnConf.dateEnd
      }
    })) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  tableBasicConf.columns.push(newColumnConf)
  if (fromColumnName) {
    const fromColumnIdx = layout.columns.findIndex(column => column.name == fromColumnName)!
    layout.columns.splice(fromColumnIdx + 1, 0, newLayoutColumnConf)
  } else {
    layout.columns.push(newLayoutColumnConf)
  }
  if (Array.isArray(layout.data)) {
    layout.data.forEach((d) => {
      d.records.forEach((record) => {
        if (fromColumnName) {
          record[newColumnConf.name] = record[fromColumnName]
        } else {
          record[newColumnConf.name] = getDefaultValueByDataKind(newColumnConf.dataKind!)
        }
      })
    })
  } else {
    layout.data?.records.forEach((record) => {
      if (fromColumnName) {
        record[newColumnConf.name] = record[fromColumnName]
      } else {
        record[newColumnConf.name] = getDefaultValueByDataKind(newColumnConf.dataKind!)
      }
    })
  }
  return true
  // TODO agg清空，重新计算
}

async function modifyColumn(changedColumnConf?: TableColumnConf, changedLayoutColumnConf?: TableLayoutColumnConf, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id == currentLayoutId.value)!
  if (changedColumnConf && (!props.events.modifyColumn || !await props.events.modifyColumn({
    name: changedColumnConf.name,
    title: changedColumnConf.title,
    icon: changedColumnConf.icon,
    dataKind: changedColumnConf.dataKind,
    dataEditable: changedColumnConf.dataEditable,
  }))) {
    return false
  }
  if (changedLayoutColumnConf && (!props.events.modifyLayout || !await props.events.modifyLayout({
    id: currentLayoutId.value,
    changedColumn: {
      name: changedLayoutColumnConf.name,
      wrap: changedLayoutColumnConf.wrap,
      fixed: changedLayoutColumnConf.fixed,
      width: changedLayoutColumnConf.width,
      hide: changedLayoutColumnConf.hide,
      dateStart: changedLayoutColumnConf.dateStart,
      dateEnd: changedLayoutColumnConf.dateEnd
    }
  }))) {
    return false
  }
  if (reLoad) {
    await loadData()
    return true
  }
  if (changedColumnConf) {
    const oldColumnIdx = tableBasicConf.columns.findIndex(column => column.name == changedColumnConf.name)
    tableBasicConf.columns.splice(oldColumnIdx, 1, changedColumnConf)
  }
  if (changedLayoutColumnConf) {
    const oldColumnIdx = layout.columns.findIndex(column => column.name == changedLayoutColumnConf.name)
    layout.columns.splice(oldColumnIdx, 1, changedLayoutColumnConf)
  }
  return true
  // TODO agg清空，重新计算
}

async function deleteColumn(deletedColumnName: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id == currentLayoutId.value)!
  if (props.events.deleteColumn && props.events.modifyLayout && await props.events.deleteColumn(deletedColumnName) && await props.events.modifyLayout({
    id: currentLayoutId.value,
    deletedColumnName: deletedColumnName
  })) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  const oldColumnIdx = tableBasicConf.columns.findIndex(column => column.name == deletedColumnName)
  tableBasicConf.columns.splice(oldColumnIdx, 1)
  const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name == deletedColumnName)
  layout.columns.splice(oldLayoutColumnIdx, 1)
  if (Array.isArray(layout.data)) {
    layout.data.forEach((d) => {
      d.records.forEach((record) => {
        delete (record[deletedColumnName])
      })
    })
  } else {
    layout.data?.records.forEach((record) => {
      delete (record[deletedColumnName])
    })
  }
  return true
  // TODO agg清空，重新计算
}

async function newLayout(newLayoutConf: TableLayoutConf, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  if (props.events.newLayout && (await props.events.newLayout({
    id: newLayoutConf.id,
    title: newLayoutConf.title,
    layoutKind: newLayoutConf.layoutKind,
    icon: newLayoutConf.icon,
    columns: Object.entries(newLayoutConf.columns).map(([name, column]) => {
      return {
        name: name,
        wrap: column.wrap,
        fixed: column.fixed,
        width: column.width,
        hide: column.hide,
        dateStart: column.dateStart,
        dateEnd: column.dateEnd
      }
    }),
    filters: newLayoutConf.filters,
    sorts: newLayoutConf.sorts,
    group: newLayoutConf.group,
    aggs: newLayoutConf.aggs,
  }))) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  tableLayoutsConf.push(newLayoutConf)
  return true
  // TODO agg清空，重新计算
}

async function modifyLayout(changedLayoutReq: TableLayoutModifyReq, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = changedLayoutReq.id ? tableLayoutsConf.find(layout => layout.id == changedLayoutReq.id)! : tableLayoutsConf.find(layout => layout.id == currentLayoutId.value)!
  if (props.events.modifyLayout && (await props.events.modifyLayout(changedLayoutReq))) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  changedLayoutReq.title && (layout.title = changedLayoutReq.title)
  changedLayoutReq.icon && (layout.icon = changedLayoutReq.icon)
  changedLayoutReq.filters && (layout.filters = changedLayoutReq.filters)
  changedLayoutReq.sorts && (layout.sorts = changedLayoutReq.sorts)
  changedLayoutReq.group && (layout.group = changedLayoutReq.group)
  changedLayoutReq.aggs && (layout.aggs = changedLayoutReq.aggs)
  if (changedLayoutReq.deletedColumnName) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name == changedLayoutReq.deletedColumnName)
    layout.columns.splice(oldLayoutColumnIdx, 1)
  }
  changedLayoutReq.newColumn && (layout.columns.push({
    name: changedLayoutReq.newColumn.name,
    wrap: changedLayoutReq.newColumn.wrap ?? true,
    fixed: changedLayoutReq.newColumn.fixed ?? false,
    width: changedLayoutReq.newColumn.width ?? 200,
    hide: changedLayoutReq.newColumn.hide ?? false,
    dateStart: changedLayoutReq.newColumn.dateStart ?? false,
    dateEnd: changedLayoutReq.newColumn.dateEnd ?? false
  }))
  if (changedLayoutReq.changedColumn) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name == changedLayoutReq.changedColumn?.name)
    layout.columns.splice(oldLayoutColumnIdx, 1, {
      name: changedLayoutReq.changedColumn.name,
      wrap: changedLayoutReq.changedColumn.wrap ?? true,
      fixed: changedLayoutReq.changedColumn.fixed ?? false,
      width: changedLayoutReq.changedColumn.width ?? 200,
      hide: changedLayoutReq.changedColumn.hide ?? false,
      dateStart: changedLayoutReq.changedColumn.dateStart ?? false,
      dateEnd: changedLayoutReq.changedColumn.dateEnd ?? false
    })
  }
  if (changedLayoutReq.columnSortedNames) {
    const leftColumnIdx = layout.columns.findIndex(column => column.name == changedLayoutReq.columnSortedNames![0])
    const rightColumnIdx = layout.columns.findIndex(column => column.name == changedLayoutReq.columnSortedNames![1])
    const tmpColumn = layout.columns[leftColumnIdx]
    layout.columns.splice(leftColumnIdx, 1, layout.columns[rightColumnIdx])
    layout.columns.splice(rightColumnIdx, 1, tmpColumn)
  }
  return true
  // TODO agg清空，重新计算
}


async function deleteLayout(deletedLayoutId: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  if (props.events.deleteLayout && await props.events.deleteLayout(deletedLayoutId)) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  const oldColumnIdx = tableLayoutsConf.findIndex(layout => layout.id == deletedLayoutId)!
  tableLayoutsConf.splice(oldColumnIdx, 1)
  return true
  // TODO agg清空，重新计算
}

async function sortLayouts(leftLayoutId: string, rightLayoutId: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  if (props.events.sortLayouts && (await props.events.sortLayouts(leftLayoutId, rightLayoutId))) {
    if (reLoad) {
      await loadData()
      return true
    }
  } else {
    return false
  }
  const leftLayout = tableLayoutsConf.findIndex(layout => layout.id == leftLayoutId)
  const rightLayout = tableLayoutsConf.findIndex(layout => layout.id == rightLayoutId)
  const tmpLayout = tableLayoutsConf[leftLayout]
  tableLayoutsConf.splice(leftLayout, 1, tableLayoutsConf[rightLayout])
  tableLayoutsConf.splice(rightLayout, 1, tmpLayout)
  return true
  // TODO agg清空，重新计算
}

provide(FN_LOAD_DATA, loadData)
provide(FN_ADD_DATA, addData)
provide(FN_UPDATE_DATA, updateData)
provide(FN_DELETE_DATA, deleteData)
provide(FN_LOAD_CELL_OPTIONS_DATA, loadCellOptions)
provide(FN_MODIFY_STYLES, modifyStyles)
provide(FN_NEW_COLUMN, newColumn)
provide(FN_MODIFY_COLUMN, modifyColumn)
provide(FN_DELETE_COLUMN, deleteColumn)
provide(FN_NEW_LAYOUT, newLayout)
provide(FN_MODIFY_LAYOUT, modifyLayout)
provide(FN_DELETE_LAYOUT, deleteLayout)
provide(FN_SORT_LAYOUTS, sortLayouts)

// ------------- Init Events -------------

async function init() {
  tableLayoutsConf.forEach(layout => {
    loadData(layout.id)
  })
}

onMounted(async () => {
  // Set table height
  Array.prototype.forEach.call(document.getElementsByClassName('iw-tt'), function (ttEle) {
    const outHeight = ttEle.parentElement?.clientHeight
    const headerHeight = ttEle.getElementsByClassName('iw-tt-header')[0].offsetHeight
    Array.prototype.forEach.call(ttEle.getElementsByClassName('iw-tt-main'), function (layoutEle) {
      const toolbarHeight = layoutEle.getElementsByClassName('iw-tt-toolbar')[0].offsetHeight
      layoutEle.getElementsByClassName('iw-tt-table')[0].style.height = outHeight - headerHeight - toolbarHeight + 'px'
    })
  })
  await init()
})

// ------------- Layout Process -------------
const showLayoutMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const selectedLayoutEle = targetEle.parentElement as HTMLElement
  menuLayoutCompRef.value.show(selectedLayoutEle)
}

const showMoreMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  menuMoreCompRef.value.show(targetEle, MenuOffsetKind.RIGHT_BOTTOM)
}
</script>

<template>
  <div :class="tableBasicConf.styles.tableClass + ' iw-tt w-full text-base text-base-content bg-base-100'"
    :id="tableBasicConf.tableId">
    <div class=" iw-tt-header navbar p-0 min-h-0">
      <div class="flex-1">
        <template v-for="layout in tableLayoutsConf">
          <a :class="'iw-tt-header__item tab tab-bordered ' + (currentLayoutId == layout.id ? 'tab-active' : '') + ' flex flex-col'"
            @contextmenu.prevent="showLayoutMenu">
            <i :class="layout.icon + ''"></i> {{ layout.title }}
          </a>
        </template>
      </div>
      <div class="flex-none">
        <a class="cursor-pointer" @click="showMoreMenu"><i :class="iconSvg.MORE"></i></a>
        <menu-comp ref="menuMoreCompRef">
          <resize-comp :size="tableBasicConf.styles.size" :styles="tableBasicConf.styles"></resize-comp>
          <theme-comp :styles="tableBasicConf.styles"></theme-comp>
        </menu-comp>
      </div>
    </div>
    <div class="iw-tt-main">
      <template v-for="layout in tableLayoutsConf">
        <div class="iw-tt-toolbar flex items-center justify-between h-10" v-if="currentLayoutId == layout.id">
          <div class="iw-tt-toolbar-main flex ">main</div>
          <div class="iw-tt-toolbars-more flex">
            more...
          </div>
        </div>
        <div class="iw-tt-table overflow-auto w-full" v-if="currentLayoutId == layout.id">
          <list-comp :key="layout.id" :layout="layout" :basic="tableBasicConf" />
        </div>
      </template>
    </div>
  </div>
  <menu-comp ref="menuLayoutCompRef">
    <div class="iw-contextmenu__item">
      <!-- TODO 抽取 -->
      <!-- <i :class="iconSvg.RENAME"></i>
                    <input class="input input-bordered input-sm" type="text"
                      v-model="tableLayoutsConf.find(layout => layout.id == currentLayoutId)?.title" /> -->
    </div>
  </menu-comp>
</template>