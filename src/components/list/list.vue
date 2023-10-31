<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { TableShowConf } from '../conf'
import { ListBasicConf, ListColumnConf, ListConf, ListStyleConf } from './conf'
import FixedComp from './fixed.vue'
import SortComp from './sort.vue'
import ResizeComp from './resize.vue'
import FillComp from './fill.vue'
import DeleteComp from './delete.vue'
import { setFixedColumnStyles } from './fixed.vue'
import { DataKind } from '../props'
const { t } = useI18n()

const listConf = defineProps<
  ListConf & {
    show: TableShowConf
  }
>()

const basicConf = reactive<ListBasicConf>(listConf.basic)
const columnsConf = reactive<ListColumnConf[]>(listConf.columns)
const stylesConf = reactive<ListStyleConf>(listConf.styles)
const selectedDataPks = ref<string[] | number[] | undefined>()

const setColumnStyles = (colIdx: number) => {
  const styles: any = {}
  styles.width = columnsConf[colIdx].width + 'px'
  setFixedColumnStyles(styles, colIdx, listConf.show.fixedColumnIdx, columnsConf)
  return styles
}

const showHeaderContextMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const contextmenuEle = targetEle.querySelector('.iw-list-header-contextmenu') as HTMLElement
  if (contextmenuEle) {
    let targetOffset = targetEle.getBoundingClientRect()
    contextmenuEle.style.display = 'flex'
    contextmenuEle.style.left = targetOffset.left + 'px'
    contextmenuEle.style.top = targetOffset.top + targetOffset.height + 5 + 'px'
    document.addEventListener('mousedown', (e) => {
      // @ts-ignore
      if (e.target == null || !contextmenuEle.contains(e.target)) {
        contextmenuEle.style.display = 'none'
      }
    })
  }
}

const showRowContextMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const selectedRowEle = targetEle.parentElement as HTMLElement
  if (columnsConf.find((col) => col.name == basicConf.pkColumnName)?.dataKind == DataKind.NUMBER) {
    selectedDataPks.value = [parseInt(selectedRowEle.dataset.pk as string)]
  } else {
    selectedDataPks.value = [selectedRowEle.dataset.pk as string]
  }
  const contextmenuEle = selectedRowEle.parentElement?.querySelector('.iw-list-row-contextmenu') as HTMLElement
  if (contextmenuEle) {
    contextmenuEle.style.display = 'flex'
    contextmenuEle.style.left = event.x + 'px'
    contextmenuEle.style.top = event.y + 'px'
    document.addEventListener('mousedown', (e) => {
      // @ts-ignore
      if (e.target == null || !contextmenuEle.contains(e.target)) {
        contextmenuEle.style.display = 'none'
      }
    })
  }
}
</script>

<script lang="ts">
export function closeContextMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  const contextmenuEle = targetEle.closest('.iw-list-contextmenu') as HTMLElement
  contextmenuEle.style.display = 'none'
}
</script>

<template>
  <div className="iw-list" :style="{ width: columnsConf.reduce((count, col) => count + col.width, 0) + 'px' }">
    <div :className="stylesConf.headerClass + ' iw-list-header'">
      <div
        v-for="(column, colIndex) in columnsConf"
        :key="column.name"
        :className="stylesConf.cellClass + ' iw-list-cell iw-list-header-cell'"
        :data-column-name="column.name"
        :style="setColumnStyles(colIndex)"
        @click="showHeaderContextMenu"
      >
        <svg v-html="column.icon"></svg> {{ column.name }}
        <div className="iw-list-header-contextmenu iw-list-contextmenu" style="display: none">
          <fixed-comp :current-col-idx="colIndex" :basic-conf="basicConf" :show="listConf.show"></fixed-comp>
        </div>
      </div>
    </div>
    <div v-for="(row, rowIndex) in listConf.show.data" :key="row[basicConf.pkColumnName]" :data-pk="row[basicConf.pkColumnName]" :className="stylesConf.rowClass + ' iw-list-row'">
      <template v-for="(column, colIndex) in columnsConf" :key="column.name">
        <div
          :className="stylesConf.cellClass + ' iw-list-cell iw-list-row-cell iw-list--size-' + stylesConf.sizeClass"
          :data-column-name="column.name"
          :data-row-idx="rowIndex"
          :style="setColumnStyles(colIndex)"
          @contextmenu.prevent="showRowContextMenu"
        >
          {{ row[column.name] }}
        </div>
      </template>
    </div>
    <div className="iw-list-row-contextmenu iw-list-contextmenu" style="display: none">
      <delete-comp :select-pks="selectedDataPks" v-show="basicConf.editable"></delete-comp>
    </div>
  </div>
  <sort-comp :columns-conf="columnsConf"></sort-comp>
  <resize-comp :columns-conf="columnsConf"></resize-comp>
  <fill-comp :columns-conf="columnsConf" :data="listConf.show.data" :pkColumnName="listConf.basic.pkColumnName" v-if="basic.fillable"></fill-comp>
</template>

<style lang="scss" scoped>
@import '../../assets/main.scss';
@include b('list') {
  position: relative;

  @include m('size-mini') {
    padding: 1px;
    font-size: 9pt;
  }

  @include m('size-small') {
    padding: 3px;
    font-size: 10pt;
  }

  @include m('size-medium') {
    padding: 4px 5px;
    font-size: 11pt;
  }

  @include m('size-large') {
    padding: 6px 7px;
    font-size: 13pt;
  }
}

@include b('list-header') {
  display: flex;
  border-top: 1px solid var(--el-border-color);
  border-right: 1px solid var(--el-border-color);
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1100;

  @include b('list-cell') {
    display: flex;
    align-items: center;
    &:hover {
      cursor: pointer;
      background-color: var(--el-color-info-light-7);
    }

    & svg {
      width: 1em;
      height: 1em;
      margin-right: 3px;
    }
  }
}

@include b('list-contextmenu') {
  flex-direction: column;
  align-items: flex-start;
  position: fixed;
  min-width: 120px;
  min-height: 80px;
  z-index: 1000;
  border-radius: 3px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  box-shadow: 0 0 5px var(--el-border-color);
}

@include b('list-row') {
  display: flex;
  border-right: 1px solid var(--el-border-color);

  &:hover .iw-list-cell {
    background-color: var(--el-color-info-light-9);
  }
}

@include b('list-cell') {
  border-left: 1px solid var(--el-border-color);
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}
</style>

<style lang="scss">
@import '../../assets/main.scss';

@include b('list-contextmenu') {
  @include e('item') {
    display: flex;
    align-items: center;
    padding: 6px;
    margin: 0;
    cursor: pointer;

    & svg {
      width: 1em;
      height: 1em;
      margin-right: 3px;
    }
  }
}
</style>
