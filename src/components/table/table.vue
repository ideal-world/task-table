<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { TableBasicConf, TableColumnConf, TableConf, TableStyleConf } from './conf'
import FixedComp from './fixed.vue'
import SortComp from './sort.vue'
import ResizeComp from './resize.vue'
import FillComp from './fill.vue'
import { setFixedColumnStyles } from './fixed.vue'
const { t } = useI18n()

const tableConf = defineProps<TableConf>()

const basicConf = reactive<TableBasicConf>(tableConf.basic)
const columnsConf = reactive<TableColumnConf[]>(tableConf.columns)
const stylesConf = reactive<TableStyleConf>(tableConf.styles)
const data = reactive<any[]>(tableConf.data)

const setColumnStyles = (colIdx: number) => {
  const styles: any = {}
  styles.width = columnsConf[colIdx].width + 'px'
  setFixedColumnStyles(styles, colIdx, basicConf, columnsConf)
  return styles
}

const showHeaderContextMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const contextmenuEle = targetEle.querySelector('.iw-table-header-contextmenu') as HTMLElement
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
</script>

<script lang="ts">
export function closeHeaderContextMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  const contextmenuEle = targetEle.closest('.iw-table-header-contextmenu') as HTMLElement
  contextmenuEle.style.display = 'none'
}
</script>

<template>
  <div className="iw-table-wrap" style="overflow: auto; width: 100%; height: 100%">
    <div className="iw-table" :style="{ width: columnsConf.reduce((count, col) => count + col.width, 0) + 'px' }">
      <div :className="stylesConf.headerClass + ' iw-table-header'">
        <div
          v-for="(column, colIndex) in columnsConf"
          :key="column.name"
          :className="stylesConf.cellClass + ' iw-table-cell iw-table-header-cell'"
          :data-column-name="column.name"
          :style="setColumnStyles(colIndex)"
          @click="showHeaderContextMenu"
        >
          <svg v-html="column.icon"></svg> {{ column.name }}
          <div className="iw-table-header-contextmenu" style="display: none">
            <fixed-comp :current-col-idx="colIndex" :basic-conf="basicConf"></fixed-comp>
          </div>
        </div>
      </div>
      <div v-for="(row, rowIndex) in data" :key="row[columnsConf.find((col) => col.pk)?.name ?? 0]" :className="stylesConf.rowClass + ' iw-table-row'">
        <template v-for="(column, colIndex) in columnsConf" :key="column.name">
          <div
            :className="stylesConf.cellClass + ' iw-table-cell iw-table-row-cell iw-table--size-' + stylesConf.sizeClass"
            :data-column-name="column.name"
            :data-row-idx="rowIndex"
            :style="setColumnStyles(colIndex)"
          >
            {{ row[column.name] }}
          </div>
        </template>
      </div>
    </div>
  </div>
  <sort-comp :columns-conf="columnsConf"></sort-comp>
  <resize-comp :columns-conf="columnsConf"></resize-comp>
  <fill-comp :columns-conf="columnsConf" :data="data" v-if="basic"></fill-comp>
</template>

<style lang="scss" scoped>
@import '../../assets/main.scss';
@include b('table') {
  position: relative;
  border-top: 1px solid var(--el-border-color);
  border-left: 1px solid var(--el-border-color);

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

@include b('table-header') {
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;

  @include b('table-cell') {
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

  .el-dropdown,
  .el-dropdown div {
    width: 100%;
    height: 100%;
    vertical-align: middle;
    color: var(--el-text-color-regular);
  }
}

@include b('table-header-contextmenu') {
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

  :deep('table-header-contextmenu') {
    display: flex;
    align-items: center;
    padding: 6px;
    margin: 0;

    & svg {
      width: 1em;
      height: 1em;
      margin-right: 3px;
    }
  }
}

@include b('table-row') {
  display: flex;
}

@include b('table-cell') {
  border-right: 1px solid var(--el-border-color);
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}
</style>

<style lang="scss">
@import '../../assets/main.scss';

@include b('table-header-contextmenu') {
  @include e('item') {
    display: flex;
    align-items: center;
    padding: 6px;
    margin: 0;

    & svg {
      width: 1em;
      height: 1em;
      margin-right: 3px;
    }
  }
}
</style>
