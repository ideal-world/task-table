<script setup lang="ts">
import { onMounted, provide, reactive, ref } from 'vue'
import { FN_ADD_DATA, FN_DELETE_DATA, FN_LOAD_CELL_OPTIONS_DATA, FN_LOAD_DATA, FN_UPDATE_DATA } from '../constant'
import { TableShowConf, initConf } from './conf'
import * as Filter from './filter/conf'
import * as List from './list/conf'
import ListComp from './list/list.vue'
import { LayoutKind, TableProps } from './props'
import * as Sort from './sort/conf'

const props = defineProps<TableProps>()

const [tableBasicConf, tableShowsConf, tableStyleConf] = initConf(props)

const showsConf = reactive<{ [key: string]: TableShowConf }>(tableShowsConf)
const currentShowId = ref<string>('default')

async function loadData(showId?: string) {
  let show = showsConf[showId ? showId : currentShowId.value]
  const d = await props.events.loadData(Filter.parseProps(show.filters), Sort.parseProps(show.sorts), show.offsetRowNumber, show.fetchRowNumber)
  show.data.splice(0, show.data.length, ...d)
}

async function addData(newData: { [key: string]: any }[], insertIdx?: number, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) {
  let show = showsConf[currentShowId.value]
  if (props.events.saveData && (await props.events.saveData(newData))) {
    if (reLoad) {
      loadData()
      return
    }
    if (insertIdx) {
      show.data.splice(insertIdx, 0, ...newData)
    } else {
      show.data.splice(0, 0, ...newData)
    }
  }
}

async function updateData(changeData: { [key: string]: any }[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean) {
  let show = showsConf[currentShowId.value]
  if (props.events.saveData && (await props.events.saveData(changeData))) {
    if (reLoad) {
      loadData()
      return
    }
    show.data.forEach((item) => {
      const changeItem = changeData.find((d) => d[tableBasicConf.pkColumnName] == item[tableBasicConf.pkColumnName])
      if (changeItem) {
        for (let key in changeItem) {
          item[key] = changeItem[key]
        }
      }
    })
  }
}

async function deleteData(ids: string[] | number[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean) {
  let show = showsConf[currentShowId.value]
  if (props.events.deleteData && (await props.events.deleteData(ids))) {
    if (reLoad) {
      loadData()
      return
    }
    show.data.forEach((item, idx) => {
      if (ids.find((id) => id == item[tableBasicConf.pkColumnName])) {
        show.data.splice(idx, 1)
      }
    })
  }
}

async function loadCellOptions(columnName: string, cellValue: any): Promise<{ title: string; value: any }[]> {
  if (props.events.loadCellOptions) {
    return await props.events.loadCellOptions(columnName, cellValue)
  } else {
    return []
  }
}

async function init() {
  for (let showId in showsConf) {
    await loadData(showId)
  }
}

provide(FN_LOAD_DATA, loadData)
provide(FN_ADD_DATA, addData)
provide(FN_UPDATE_DATA, updateData)
provide(FN_DELETE_DATA, deleteData)
provide(FN_LOAD_CELL_OPTIONS_DATA, loadCellOptions)

const listConf = List.initConf(props, tableBasicConf)

onMounted(async () => {
  Array.prototype.forEach.call(document.getElementsByClassName('iw-tt'), function (ttEle) {
    let outHeight = ttEle.parentElement?.clientHeight
    let layoutHeight = ttEle.getElementsByClassName('iw-tt-layouts')[0].clientHeight
    Array.prototype.forEach.call(ttEle.getElementsByClassName('iw-tt-shows'), function (showEle) {
      let toolsHeight = showEle.getElementsByClassName('iw-tt-tools')[0].clientHeight
      showEle.getElementsByClassName('iw-tt-table')[0].style.height = outHeight - layoutHeight - toolsHeight + 'px'
    })
  })
  await init()
})
</script>

<template>
  <div :className="tableStyleConf.tableClass + ' iw-tt'" :id="tableBasicConf.tableId">
    <div className="iw-tt-layouts">layout...</div>
    <div className="iw-tt-shows">
      <template v-for="(show, showId) in showsConf">
        <div className="iw-tt-tools">tools...</div>
        <div class="iw-tt-table">
          <list-comp
            :key="showId"
            :basic="listConf.basic"
            :columns="listConf.columns"
            :show="show"
            :styles="listConf.styles"
            v-if="show.layout == LayoutKind.LIST"
            v-show="showId == currentShowId"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../assets/main.scss';

@include b('tt') {
  margin: 0;
  padding: 0;
  width: 100%;
}

@include b('tt-layouts') {
  height: 40px;
}

@include b('tt-tools') {
  height: 40px;
}

@include b('tt-table') {
  overflow: auto;
  width: 100%;
}
</style>
