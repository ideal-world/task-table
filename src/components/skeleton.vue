<script setup lang="ts">
import { onMounted, provide, reactive, ref, toRaw } from 'vue'
import * as iconSvg from '../assets/icon'
import { FN_ADD_DATA, FN_DELETE_DATA, FN_LOAD_CELL_OPTIONS_DATA, FN_LOAD_DATA, FN_UPDATE_DATA } from '../constant'
import MenuComp from './common/menu.vue'
import { TableLayoutConf, TableStyleConf, initConf } from './conf'
import ResizeComp from './function/resize/resize.vue'
import * as List from './layout/list/conf'
import ListComp from './layout/list/list.vue'
import { OperatorKind, SizeKind, TableProps } from './props'

const props = defineProps<TableProps>()

const [tableBasicConf, _tableLayoutsConf, _tableStyleConf] = initConf(props)
const menuCompRef = ref()

const layoutsConf = reactive<{ [key: string]: TableLayoutConf }>(_tableLayoutsConf)
const styleConf = reactive<TableStyleConf>(_tableStyleConf)
const currentLayoutId = ref<string>(props.layouts?.find((l) => l.default)?.id || Object.values(layoutsConf).sort((a, b) => a.sort - b.sort)[0].id)

// ------------- Common Events -------------
async function loadData(layoutId?: string, moreForGroupedValue?: any) {
  const layout = layoutsConf[layoutId ? layoutId : currentLayoutId.value]
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

async function addData(newRecords: { [key: string]: any }[], afterPkId?: number, groupValue?: any, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) {
  const layout = layoutsConf[currentLayoutId.value]
  if (props.events.saveData && (await props.events.saveData(newRecords))) {
    if (reLoad) {
      loadData()
      return
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
  }
  // TODO agg清空，重新计算
}

async function updateData(changedRecords: { [key: string]: any }[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean) {
  const layout = layoutsConf[currentLayoutId.value]
  if (props.events.saveData && (await props.events.saveData(changedRecords))) {
    if (reLoad) {
      loadData()
      return
    }
    if (Array.isArray(layout.data)) {
      layout.data.forEach(groupData => {
        groupData.records.forEach((needChangeRecord) => {
          const changedRecord = changedRecords.find((r) => r[tableBasicConf.pkColumnName] === needChangeRecord[tableBasicConf.pkColumnName])
          if (changedRecord) {
            for (let key in changedRecord) {
              needChangeRecord[key] = changedRecord[key]
            }
          }
        })
      })
    } else if (layout.data && !Array.isArray(layout.data)) {
      layout.data.records.forEach((needChangeRecord) => {
        const changedRecord = changedRecords.find((r) => r[tableBasicConf.pkColumnName] === needChangeRecord[tableBasicConf.pkColumnName])
        if (changedRecord) {
          for (let key in changedRecord) {
            needChangeRecord[key] = changedRecord[key]
          }
        }
      })
    } else {
      // Empty,unreachable
    }
  }
  // TODO agg清空，重新计算
}

async function deleteData(deletedPks: any[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean) {
  const layout = layoutsConf[currentLayoutId.value]
  if (props.events.deleteData && (await props.events.deleteData(deletedPks))) {
    if (reLoad) {
      loadData()
      return
    }
    if (Array.isArray(layout.data)) {
      layout.data.forEach((d) => {
        d.records.forEach((item, idx) => {
          if (deletedPks.includes(item[tableBasicConf.pkColumnName])) {
            d.records.splice(idx, 1)
          }
        })
      })
    } else if (layout.data && !Array.isArray(layout.data)) {
      layout.data.records.forEach((item, idx) => {
        console.log('----' + item[tableBasicConf.pkColumnName])
        console.log('--+--' + deletedPks)
        if (deletedPks.includes(item[tableBasicConf.pkColumnName])) {
          // @ts-ignore
          layout.data.records.splice(idx, 1)
        }
      })
    } else {
      // Empty,unreachable
    }
  }
  // TODO agg清空，重新计算
}

async function loadCellOptions(columnName: string, cellValue: any): Promise<{ title: string; value: any }[]> {
  if (props.events.loadCellOptions) {
    return await props.events.loadCellOptions(columnName, cellValue)
  } else {
    return []
  }
}

provide(FN_LOAD_DATA, loadData)
provide(FN_ADD_DATA, addData)
provide(FN_UPDATE_DATA, updateData)
provide(FN_DELETE_DATA, deleteData)
provide(FN_LOAD_CELL_OPTIONS_DATA, loadCellOptions)

// ------------- Init Events -------------

async function init() {
  for (let layoutId in layoutsConf) {
    await loadData(layoutId)
  }
}

onMounted(async () => {
  // Set table height
  Array.prototype.forEach.call(document.getElementsByClassName('iw-tt'), function (ttEle) {
    let outHeight = ttEle.parentElement?.clientHeight
    let headerHeight = ttEle.getElementsByClassName('iw-tt-header')[0].offsetHeight
    Array.prototype.forEach.call(ttEle.getElementsByClassName('iw-tt-main'), function (layoutEle) {
      let toolbarHeight = layoutEle.getElementsByClassName('iw-tt-toolbar')[0].offsetHeight
      layoutEle.getElementsByClassName('iw-tt-table')[0].style.height = outHeight - headerHeight - toolbarHeight + 'px'
    })
  })
  await init()
})

// ------------- Layout Process -------------
const showLayoutMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const selectedLayoutEle = targetEle.parentElement as HTMLElement
  menuCompRef.value.show(selectedLayoutEle)
}

const listConf = List.initConf(props, tableBasicConf)
</script>

<template>
  <div :className="styleConf.tableClass + ' iw-tt'" :id="tableBasicConf.tableId">
    <div class="iw-tt-header">
      <template v-for="(layout, layoutId) in layoutsConf">
        <div
          :class="currentLayoutId == layoutId ? 'iw-tt-header__item iw-tt-header__item--active' : 'iw-tt-header__item'">
          <svg v-html="layout.icon"></svg> {{ layout.title }}<svg @click="showLayoutMenu" v-html="iconSvg.MORE1"></svg>
        </div>
      </template>
    </div>
    <div class="iw-tt-main">
      <template v-for="layout in  Object.values(layoutsConf).sort((a, b) => a.sort - b.sort)">
        <div className="iw-tt-toolbar" v-if="currentLayoutId == layout.id">
          <div className="iw-tt-toolbar-main">main</div>
          <div className="iw-tt-toolbars-more">
            <resize-comp :size="styleConf.size" @size="(size: SizeKind) => styleConf.size = size"></resize-comp>
          </div>
        </div>
        <div class="iw-tt-table" v-if="currentLayoutId == layout.id">
          <list-comp :key="layout.id" :basic="listConf.basic" :columns="listConf.columns" :layout="layout"
            :styles="listConf.styles" :global-styles="styleConf" />
        </div>
      </template>
    </div>
  </div>
  <menu-comp ref="menuCompRef" className="iw-tt-contextmenu">
    <div class="iw-contextmenu__item"><svg v-html="iconSvg.RENAME"></svg> <input
        v-model="layoutsConf[currentLayoutId].title" /></div>
  </menu-comp>
</template>

<style lang="scss" scoped>
@import '../assets/main.scss';

@include b('tt') {
  margin: 0;
  padding: 0;
  font-size: 11pt;
  width: 100%;
}

@include b('tt-header') {
  display: flex;
  align-items: center;
  padding: 2px;
  margin: 0;
  border-bottom: 1px solid var(--el-border-color);

  @include e('item') {
    display: flex;
    align-items: center;
    padding: 1px;
    margin: 0;
    cursor: pointer;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;

    & svg {
      width: 1em;
      height: 1em;
      margin-right: 3px;
    }

    @include m('active') {
      background-color: var(--el-color-info-light-7);
    }
  }
}

@include b('tt-toolbar') {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}

@include b('tt-toolbar-main') {
  display: flex;
}

@include b('tt-toolbar-more') {
  display: flex;
}

@include b('tt-table') {
  overflow: auto;
  width: 100%;
}
</style>

<style lang="scss">
@import '../assets/main.scss';

@include b('tt-toolbar') {
  & svg {
    width: 1em;
    height: 1em;
    margin-right: 3px;
  }

  &>div>div {
    display: flex;
    align-items: center;
    padding: 6px;
    margin: 0;
    cursor: pointer;
  }
}
</style>
