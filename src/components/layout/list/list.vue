<script setup lang="ts">
import { reactive, ref } from 'vue'
import MenuComp from '../../common/menu.vue'
import { TableLayoutConf, TableStyleConf } from '../../conf'
import { TableDataResp } from '../../props'
import AggsComp from './aggs.vue'
import { ListBasicConf, ListColumnConf, ListConf, ListStyleConf } from './conf'
import FillComp from './fill.vue'
import FixedComp, { setFixedColumnStyles } from './fixed.vue'
import ResizeComp from './resize.vue'
import RowsComp from './rows.vue'
import SortComp from './sort.vue'

const listConf = defineProps<
  ListConf & {
    layout: TableLayoutConf
    globalStyles: TableStyleConf
  }
>()

const basicConf = reactive<ListBasicConf>(listConf.basic)
const columnsConf = reactive<ListColumnConf[]>(listConf.columns)
const stylesConf = reactive<ListStyleConf>(listConf.styles)
const headerMenuCompRefs = ref()

const setColumnStyles = (colIdx: number) => {
  const styles: any = {}
  styles.width = columnsConf[colIdx].width + 'px'
  setFixedColumnStyles(styles, colIdx, listConf.layout.fixedColumnIdx, columnsConf)
  return styles
}

const showHeaderContextMenu = (event: MouseEvent, colIdx: number) => {
  const targetEle = event.target as HTMLElement
  headerMenuCompRefs.value[colIdx].show(targetEle)
}

</script>

<template>
  <div :class="'iw-list relative iw-list--size-' + listConf.globalStyles.size"
    :style="{ width: columnsConf.reduce((count, col) => count + col.width, 0) + 'px' }">
    <div
      :class="stylesConf.headerClass + ' iw-list-header flex items-center sticky top-0 z-[1100] border-solid border-t border-t-base-300 border-r border-r-base-300'">
      <div v-for="(column, colIdx) in columnsConf" :key="column.name"
        :class="stylesConf.cellClass + ' iw-list-cell iw-list-header-cell flex items-center bg-base-100 border-solid border-b border-b-base-300 border-l  border-l-base-300 hover:cursor-pointer hover:bg-base-200'"
        :data-column-name="column.name" :style="setColumnStyles(colIdx)"
        @click="(event: MouseEvent) => showHeaderContextMenu(event, colIdx)">
        <i :class="column.icon"></i> {{ column.name }}
        <menu-comp ref="headerMenuCompRefs">
          <fixed-comp :current-col-idx="colIdx" :basic-conf="basicConf" :layout="listConf.layout"></fixed-comp>
        </menu-comp>
      </div>
    </div>
    <template v-if="listConf.layout.data && !Array.isArray(listConf.layout.data)">
      <rows-comp :records="listConf.layout.data.records" :pk-column-name="basicConf.pkColumnName"
        :columns-conf="columnsConf" :styles-conf="stylesConf" :editable="basicConf.editable"
        :set-column-styles="setColumnStyles"></rows-comp>
      <aggs-comp :layout-aggs="layout.aggs!" :data-basic="(layout.data as TableDataResp)"
        :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf" :styles-conf="stylesConf"
        :set-column-styles="setColumnStyles"></aggs-comp>
    </template>
    <template v-else-if="listConf.layout.data && Array.isArray(listConf.layout.data)">
      <template v-for="groupData in listConf.layout.data">
        <aggs-comp :layout-aggs="layout.aggs!" :data-basic="groupData" :pk-column-name="listConf.basic.pkColumnName"
          :columns-conf="columnsConf" :styles-conf="stylesConf" :group-value="groupData.groupValue"
          :set-column-styles="setColumnStyles"></aggs-comp>
        <rows-comp :records="groupData.records" :pk-column-name="basicConf.pkColumnName" :columns-conf="columnsConf"
          :styles-conf="stylesConf" :editable="basicConf.editable" :set-column-styles="setColumnStyles"></rows-comp>
      </template>
    </template>
  </div>
  <sort-comp :columns-conf="columnsConf"></sort-comp>
  <resize-comp :columns-conf="columnsConf"></resize-comp>
  <fill-comp :columns-conf="columnsConf" :data="listConf.layout.data!" :pk-column-name="listConf.basic.pkColumnName"
    v-if="basic.fillable"></fill-comp>
</template>

<style lang="css" scoped>
.iw-list--size-mini {
  @apply text-xs;

  .iw-list-cell {
    @apply p-0
  }
}

.iw-list--size-small {
  @apply text-sm;

  .iw-list-cell {
    @apply p-0.5
  }
}

.iw-list--size-medium {
  @apply text-base;

  .iw-list-cell {
    @apply p-1
  }
}

.iw-list--size-large {
  @apply text-lg;

  .iw-list-cell {
    @apply p-2
  }
}
</style>
