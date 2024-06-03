<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getParentWithClass } from '../../../utils/basic'
import type MenuComp from '../../common/Menu.vue'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import type { TableDataResp } from '../../../props'
import { DataKind } from '../../../props'
import CellEditComp from './CellEdit.vue'
import type { CellSelectedInfo } from './CellSelect.vue'
import CellSelectComp from './CellSelect.vue'
import ColumnAggsComp from './ColumnAggs.vue'
import { setFixedColumnStyles } from './ColumnFixed.vue'
import HeaderComp from './Header.vue'
import RowCopyPasteComp from './RowCopyPaste.vue'
import RowDeleteComp from './RowDelete.vue'
import RowSelectComp from './RowSelect.vue'
import RowsComp from './Rows.vue'

const listConf = defineProps<
  {
    layout: TableLayoutConf
    basic: TableBasicConf
  }
>()

const COLUMN_SELECT_WIDTH = listConf.layout.showSelectColumn ? 30 : 0

const selectedDataPks = ref<string[] | number[]>([])
const selectedCellWrap = ref<{
  cellSelectedInfo: CellSelectedInfo | undefined
}>({
  cellSelectedInfo: undefined,
})
const pkKindIsNumber = listConf.basic.columns.some(col => col.name === listConf.basic.pkColumnName && [DataKind.NUMBER, DataKind.SERIAL].includes(col.dataKind))

const columnsWithoutHideConf = computed<CachedColumnConf[]>(() => {
  return listConf.layout.columns.filter(column => !column.hide).map((column) => {
    return {
      ...listConf.basic.columns.find(col => col.name === column.name)!,
      ...column,
    }
  })
})

const rowMenuCompRef = ref<InstanceType<typeof MenuComp>>()

function showRowContextMenu(event: PointerEvent) {
  rowMenuCompRef.value?.show(event)
}

function setColumnStyles(colIdx: number) {
// ColIdx of selected column = -1
  const styles: any = {}
  if (colIdx === -1) {
    styles.width = `${COLUMN_SELECT_WIDTH}px`
  }
  else {
    styles.width = `${columnsWithoutHideConf.value[colIdx].width}px`
    setFixedColumnStyles(styles, colIdx, columnsWithoutHideConf.value)
  }
  return styles
}

function setTableWidth() {
  const styles: any = {}
  styles.width = `${listConf.layout.columns.filter(column => !column.hide).reduce((count, col) => count + col.width, COLUMN_SELECT_WIDTH)}px`
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
  test: {{ selectedDataPks }}
  <div
    :class="`iw-list relative iw-list--size${listConf.basic.styles.size}`"
    :style="setTableWidth()"
  >
    <HeaderComp :columns-conf="columnsWithoutHideConf" :layout="listConf.layout" :basic="listConf.basic" :set-column-styles="setColumnStyles" />
    <template v-if="listConf.layout.data && !Array.isArray(listConf.layout.data)">
      <RowsComp
        :records="listConf.layout.data.records" :pk-column-name="listConf.basic.pkColumnName"
        :parent-pk-column-name="listConf.basic.parentPkColumnName"
        :expand-data-pks="listConf.layout.expandDataPks"
        :pk-kind-is-number="pkKindIsNumber"
        :columns-conf="columnsWithoutHideConf" :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"
      />
      <!-- <ColumnAggsComp
        v-if="layout.aggs"
        :layout-aggs="layout.aggs" :data-basic="layout.data as TableDataResp"
        :columns-conf="columnsWithoutHideConf" :styles-conf="listConf.basic.styles"
        :set-column-styles="setColumnStyles"
      /> -->
    </template>
    <!-- <template v-else-if="listConf.layout.data && Array.isArray(listConf.layout.data)">
      <template v-for="groupData in listConf.layout.data" :key="groupData.groupValue">
        <ColumnAggsComp
          v-if="layout.aggs"
          :layout-aggs="layout.aggs" :data-basic="groupData"
          :columns-conf="columnsWithoutHideConf" :styles-conf="listConf.basic.styles"
          :group-value="groupData.groupValue" :set-column-styles="setColumnStyles"
        />
        <RowsComp
          :records="groupData.records" :pk-column-name="listConf.basic.pkColumnName" :parent-pk-column-name="listConf.basic.parentPkColumnName"
          :expand-data-pks="listConf.layout.expandDataPks"
          :pk-kind-is-number="pkKindIsNumber"
          :columns-conf="columnsWithoutHideConf"
          :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"
        />
      </template>
    </template> -->
    <!-- <CellSelectComp
      :wrap="selectedCellWrap" :columns-conf="columnsWithoutHideConf"
      :pk-column-name="listConf.basic.pkColumnName"
      :pk-kind-is-number="pkKindIsNumber"
    />
    <CellEditComp
      :columns-conf="columnsWithoutHideConf" :data="listConf.layout.data!"
      :pk-column-name="listConf.basic.pkColumnName"
      :selected-cell-info="selectedCellWrap.cellSelectedInfo"
    /> -->
  </div>
  <!-- <MenuComp v-if="selectedDataPks.length > 0" ref="rowMenuCompRef">
    <RowCopyPasteComp :selected-pks="selectedDataPks" :pk-column-name="listConf.basic.pkColumnName" />
    <RowDeleteComp :selected-pks="selectedDataPks" />
  </MenuComp>  -->
  <RowSelectComp
    v-if="listConf.layout.showSelectColumn"
    :selected-pks="selectedDataPks" :pk-column-name="listConf.basic.pkColumnName"
    :pk-kind-is-number="pkKindIsNumber"
  />
</template>

<style lang="css">
.iw-list--size-xs {
  @apply text-xs;

  .iw-list-cell {
    @apply p-0
  }
}

.iw-list--size-sm {
  @apply text-sm;

  .iw-list-cell {
    @apply p-[1px]
  }
}

.iw-list--size {
  @apply text-base;

  .iw-list-cell {
    @apply p-[2px]
  }
}

.iw-list--size-lg {
  @apply text-lg;

  .iw-list-cell {
    @apply p-1.5
  }
}
</style>
