<script setup lang="ts">
import { onMounted, provide, reactive, ref } from 'vue'
import { FN_ADD_DATA, FN_DELETE_DATA, FN_LOAD_CELL_OPTIONS_DATA, FN_LOAD_DATA, FN_UPDATE_DATA } from '../constant'
import { TableShowConf, TableStyleConf, initConf } from './conf'
import MenuComp from './common/menu.vue'
import * as Filter from './filter/conf'
import * as List from './list/conf'
import ListComp from './list/list.vue'
import SizeComp from './tools/size.vue'
import { LayoutKind, SizeKind, TableProps } from './props'
import * as Sort from './sort/conf'
import * as iconSvg from '../assets/icon'

const props = defineProps<TableProps>()

const [tableBasicConf, _tableShowsConf, _tableStyleConf] = initConf(props)
const menuCompRef = ref()

const showsConf = reactive<{ [key: string]: TableShowConf }>(_tableShowsConf)
const styleConf = reactive<TableStyleConf>(_tableStyleConf)
const currentShowId = ref<string>('default')

// ------------- Common Events -------------
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

provide(FN_LOAD_DATA, loadData)
provide(FN_ADD_DATA, addData)
provide(FN_UPDATE_DATA, updateData)
provide(FN_DELETE_DATA, deleteData)
provide(FN_LOAD_CELL_OPTIONS_DATA, loadCellOptions)

// ------------- Init Events -------------

async function init() {
  for (let showId in showsConf) {
    await loadData(showId)
  }
}

onMounted(async () => {
  // Set table height
  Array.prototype.forEach.call(document.getElementsByClassName('iw-tt'), function (ttEle) {
    let outHeight = ttEle.parentElement?.clientHeight
    let layoutHeight = ttEle.getElementsByClassName('iw-tt-layouts')[0].offsetHeight
    Array.prototype.forEach.call(ttEle.getElementsByClassName('iw-tt-shows'), function (showEle) {
      let toolsHeight = showEle.getElementsByClassName('iw-tt-tools')[0].offsetHeight
      showEle.getElementsByClassName('iw-tt-table')[0].style.height = outHeight - layoutHeight - toolsHeight + 'px'
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
    <div className="iw-tt-layouts">
      <div v-for="(show, showId) in showsConf" :class="'iw-tt-layout' + [currentShowId == showId ? ' iw-tt-layout--active' : '']">
        <svg v-html="show.icon"></svg> {{ show.title }}<svg @click="showLayoutMenu" v-html="iconSvg.MORE1"></svg>
      </div>
    </div>
    <div className="iw-tt-shows">
      <template v-for="(show, showId) in showsConf">
        <div className="iw-tt-tools">
          <div className="iw-tt-tools-main">main</div>
          <div className="iw-tt-tools-more">
            <size-comp :size="styleConf.size" @size="(size:SizeKind)=> styleConf.size=size"></size-comp>
          </div>
        </div>
        <div class="iw-tt-table">
          <list-comp
            :key="showId"
            :basic="listConf.basic"
            :columns="listConf.columns"
            :show="show"
            :styles="listConf.styles"
            :global-styles="styleConf"
            v-if="show.layoutKind == LayoutKind.LIST"
            v-show="showId == currentShowId"
          />
        </div>
      </template>
    </div>
    <menu-comp ref="menuCompRef" className="iw-tt-layout-contextmenu">
      <div class="iw-contextmenu__item"><svg v-html="iconSvg.RENAME"></svg> <input v-model="showsConf[currentShowId].title" /></div>
    </menu-comp>
  </div>
</template>

<style lang="scss" scoped>
@import '../assets/main.scss';

@include b('tt') {
  margin: 0;
  padding: 0;
  font-size: 11pt;
  width: 100%;
}

@include b('tt-layouts') {
  display: flex;
  align-items: center;
  padding: 2px;
  margin: 0;
  border-bottom: 1px solid var(--el-border-color);
}

@include b('tt-layout') {
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

@include b('tt-tools') {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}

@include b('tt-tools-main') {
  display: flex;
}

@include b('tt-tools-more') {
  display: flex;
}

@include b('tt-table') {
  overflow: auto;
  width: 100%;
}
</style>

<style lang="scss">
@import '../assets/main.scss';

@include b('tt-tools') {
  & svg {
    width: 1em;
    height: 1em;
    margin-right: 3px;
  }

  & > div > div {
    display: flex;
    align-items: center;
    padding: 6px;
    margin: 0;
    cursor: pointer;
  }
}
</style>
