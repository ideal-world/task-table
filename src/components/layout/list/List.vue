<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getParentWithClass } from '../../../utils/basic'
import MenuComp from '../../common/Menu.vue'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import type { TableDataResp } from '../../props'
import { DataKind } from '../../props'
import CellEditComp from './CellEdit.vue'
import CellFillComp from './CellFill.vue'
import type { CellSelectedInfo } from './CellSelect.vue'
import CellSelectComp from './CellSelect.vue'
import ColumnAggsComp from './ColumnAggs.vue'
import { setFixedColumnStyles } from './ColumnFixed.vue'
import DataLoadComp from './DataLoad.vue'
import HeaderComp from './Header.vue'
import RowCopyPasteComp from './RowCopyPaste.vue'
import RowDeleteComp from './RowDelete.vue'
import RowNewComp from './RowNew.vue'
import RowSelectComp from './RowSelect.vue'
import RowsComp from './Rows.vue'

const listConf = defineProps<
  {
    layout: TableLayoutConf
    basic: TableBasicConf
  }
>()

const NEW_COLUMN_WIDTH = 80

const selectedDataPks = ref<string[] | number[]>([])
const selectedCellWrap = ref<{
  cellSelectedInfo: CellSelectedInfo | undefined
}>({
  cellSelectedInfo: undefined,
})
const pkKindIsNumber = listConf.basic.columns.some(col => col.name === listConf.basic.pkColumnName && [DataKind.NUMBER, DataKind.SERIAL].includes(col.dataKind))

const columnsConf = computed<CachedColumnConf[]>(() => {
  return listConf.layout.columns.filter(column => !column.hide).map((column) => {
    return {
      ...column,
      ...listConf.basic.columns.find(col => col.name === column.name)!,
    }
  })
})

const rowMenuCompRef = ref()

function showRowContextMenu(event: PointerEvent) {
  rowMenuCompRef.value && rowMenuCompRef.value.show(event)
}

function setColumnStyles(colIdx: number) {
  const styles: any = {}
  if (colIdx === -1) {
    styles.width = `${NEW_COLUMN_WIDTH}px`
  }
  else {
    styles.width = `${columnsConf.value[colIdx].width}px`
    setFixedColumnStyles(styles, colIdx, columnsConf.value)
  }
  return styles
}

function setTableWidth() {
  const styles: any = {}
  styles.width = `${listConf.layout.columns.filter(column => !column.hide).reduce((count, col) => count + col.width, NEW_COLUMN_WIDTH)}px`
  return styles
}

onMounted(() => {
  document.querySelectorAll('.iw-list').forEach((listEle) => {
    listEle.addEventListener('contextmenu', (event) => {
      const pkEle = getParentWithClass(event.target as HTMLElement, 'iw-list-data-pk-cell')
      if (pkEle === null)
        return

      event.preventDefault()
      showRowContextMenu(event as PointerEvent)
    })
  })
})
</script>

<template>
  <div
    :class="`iw-list relative iw-list--size-${listConf.basic.styles.size}`"
    :style="setTableWidth()"
  >
    <HeaderComp :columns-conf="columnsConf" :layout="listConf.layout" :basic="listConf.basic" :set-column-styles="setColumnStyles" />
    <template v-if="listConf.layout.data && !Array.isArray(listConf.layout.data)">
      <RowsComp
        :records="listConf.layout.data.records" :pk-column-name="listConf.basic.pkColumnName"
        :expand-data-pks="listConf.layout.expandDataPks"
        :pk-kind-is-number="pkKindIsNumber"
        :columns-conf="columnsConf" :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"
      />
      <DataLoadComp :group-value="undefined" :total-number="listConf.layout.data.totalNumber" :loaded-number="listConf.layout.data.records.length" />
      <ColumnAggsComp
        :layout-aggs="layout.aggs!" :data-basic="layout.data as TableDataResp"
        :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf" :styles-conf="listConf.basic.styles"
        :set-column-styles="setColumnStyles"
      />
    </template>
    <template v-else-if="listConf.layout.data && Array.isArray(listConf.layout.data)">
      <template v-for="groupData in listConf.layout.data" :key="groupData.groupValue">
        <ColumnAggsComp
          :layout-aggs="layout.aggs!" :data-basic="groupData"
          :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf" :styles-conf="listConf.basic.styles"
          :group-value="groupData.groupValue" :set-column-styles="setColumnStyles"
        />
        <RowsComp
          :records="groupData.records" :pk-column-name="listConf.basic.pkColumnName" :parent-pk-column-name="listConf.basic.parentPkColumnName"
          :expand-data-pks="listConf.layout.expandDataPks"
          :pk-kind-is-number="pkKindIsNumber"
          :columns-conf="columnsConf"
          :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"
        />
        <DataLoadComp :group-value="groupData.groupValue" :total-number="groupData.totalNumber" :loaded-number="groupData.records.length" />
      </template>
    </template>
    <CellSelectComp
      :wrap="selectedCellWrap" :columns-conf="columnsConf"
      :pk-column-name="listConf.basic.pkColumnName"
      :pk-kind-is-number="pkKindIsNumber"
    />
    <CellFillComp
      :columns-conf="columnsConf" :data="listConf.layout.data!"
      :pk-column-name="listConf.basic.pkColumnName"
      :pk-kind-is-number="pkKindIsNumber"
      :selected-cell-info="selectedCellWrap.cellSelectedInfo"
    />
    <CellEditComp
      :columns-conf="columnsConf" :data="listConf.layout.data!"
      :pk-column-name="listConf.basic.pkColumnName"
      :selected-cell-info="selectedCellWrap.cellSelectedInfo"
    />
  </div>
  <MenuComp v-if="selectedDataPks.length > 0" ref="rowMenuCompRef">
    <RowCopyPasteComp :selected-pks="selectedDataPks" :pk-column-name="listConf.basic.pkColumnName" />
    <RowDeleteComp :selected-pks="selectedDataPks" />
    <RowNewComp :selected-pks="selectedDataPks" />
  </MenuComp>
  <RowSelectComp
    :selected-pks="selectedDataPks" :pk-column-name="listConf.basic.pkColumnName"
    :pk-kind-is-number="pkKindIsNumber"
  />
</template>

<style lang="css">
.iw-list--size-mini {
  @apply text-xs;

  .iw-list-cell {
    @apply p-0
  }
}

.iw-list--size-small {
  @apply text-sm;

  .iw-list-cell {
    @apply p-[1px]
  }
}

.iw-list--size-medium {
  @apply text-base;

  .iw-list-cell {
    @apply p-[2px]
  }
}

.iw-list--size-large {
  @apply text-lg;

  .iw-list-cell {
    @apply p-1.5
  }
}
</style>
