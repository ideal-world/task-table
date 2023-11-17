<script setup lang="ts">
import { computed, ref } from 'vue'
import MenuComp from '../../common/Menu.vue'
import { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import { TableDataResp } from '../../props'
import CellFillComp from './CellFill.vue'
import CellWrapComp from './CellWrap.vue'
import ColumnAggsComp from './ColumnAggs.vue'
import ColumnCopyComp from './ColumnCopy.vue'
import ColumnDeleteComp from './ColumnDelete.vue'
import ColumnFixedComp, { setFixedColumnStyles } from './ColumnFixed.vue'
import ColumnRenameComp from './ColumnRename.vue'
import ColumnResizeComp from './ColumnResize.vue'
import ColumnSortComp from './ColumnSort.vue'
import RowsComp from './Rows.vue'

const listConf = defineProps<
  {
    layout: TableLayoutConf
    basic: TableBasicConf
  }
>()

const columnsConf = computed<CachedColumnConf[]>(() => {
  return listConf.layout.columns.map(column => {
    return {
      ...column,
      ...listConf.basic.columns.find(col => col.name == column.name)!
    }
  })
})

const headerMenuCompRef = ref()
const selectedColumnName = ref<string>('')

const setColumnStyles = (colIdx: number) => {
  const styles: any = {}
  styles.width = columnsConf.value[colIdx].width + 'px'
  setFixedColumnStyles(styles, colIdx, columnsConf.value)
  return styles
}

const showHeaderContextMenu = (event: MouseEvent, columName: string) => {
  selectedColumnName.value = columName
  const targetEle = event.target as HTMLElement
  headerMenuCompRef.value.show(targetEle)
}

</script>

<template>
  <div :class="'iw-list relative iw-list--size-' + listConf.basic.styles.size"
    :style="{ width: Object.values(layout.columns).reduce((count, col) => count + col.width, 0) + 'px' }">
    <div
      :class="listConf.basic.styles.headerClass + ' iw-list-header flex items-center sticky top-0 z-[1500] border-solid border-t border-t-base-300 border-r border-r-base-300'">
      <div v-for="(column, colIdx) in columnsConf" :key="column.name"
        :class="listConf.basic.styles.cellClass + ' iw-list-cell iw-list-header-cell flex items-center bg-base-100 border-solid border-b border-b-base-300 border-l  border-l-base-300 hover:cursor-pointer hover:bg-base-200'"
        :data-column-name="column.name" :style="setColumnStyles(colIdx)"
        @click="(event: MouseEvent) => showHeaderContextMenu(event, column.name)">
        <i :class="column.icon + ' mr-1'"></i> {{ column.title }}
      </div>
    </div>
    <template v-if="listConf.layout.data && !Array.isArray(listConf.layout.data)">
      <rows-comp :records="listConf.layout.data.records" :pk-column-name="listConf.basic.pkColumnName"
        :columns-conf="columnsConf" :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"></rows-comp>
      <column-aggs-comp :layout-aggs="layout.aggs!" :data-basic="(layout.data as TableDataResp)"
        :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf" :styles-conf="listConf.basic.styles"
        :set-column-styles="setColumnStyles"></column-aggs-comp>
    </template>
    <template v-else-if="listConf.layout.data && Array.isArray(listConf.layout.data)">
      <template v-for="groupData in listConf.layout.data">
        <column-aggs-comp :layout-aggs="layout.aggs!" :data-basic="groupData"
          :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf" :styles-conf="listConf.basic.styles"
          :group-value="groupData.groupValue" :set-column-styles="setColumnStyles"></column-aggs-comp>
        <rows-comp :records="groupData.records" :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf"
          :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"></rows-comp>
      </template>
    </template>
  </div>
  <column-sort-comp :columns-conf="columnsConf"></column-sort-comp>
  <column-resize-comp :columns-conf="columnsConf"></column-resize-comp>
  <cell-fill-comp :columns-conf="columnsConf" :data="listConf.layout.data!"
    :pk-column-name="listConf.basic.pkColumnName"></cell-fill-comp>
  <menu-comp ref="headerMenuCompRef">
    <column-rename-comp :cur-column-name="selectedColumnName" :columns-conf="columnsConf"
      :pk-column-name="listConf.basic.pkColumnName"></column-rename-comp>
    <column-copy-comp :cur-column-name="selectedColumnName" :columns-conf="columnsConf"></column-copy-comp>
    <column-delete-comp :cur-column-name="selectedColumnName" :columns-conf="columnsConf"
      :pk-column-name="listConf.basic.pkColumnName"></column-delete-comp>
    <column-fixed-comp :cur-column-name="selectedColumnName" :columns-conf="columnsConf"></column-fixed-comp>
    <cell-wrap-comp :cur-column-name="selectedColumnName" :columns-conf="columnsConf"></cell-wrap-comp>
  </menu-comp>
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
