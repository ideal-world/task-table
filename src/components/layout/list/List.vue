<script setup lang="ts">
import { computed, ref } from 'vue'
import MenuComp from '../../common/Menu.vue'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import type { TableDataResp } from '../../props'
import { DataKind } from '../../props'
import CellEditComp from './CellEdit.vue'
import CellFillComp from './CellFill.vue'
import ColumnAggsComp from './ColumnAggs.vue'
import { setFixedColumnStyles } from './ColumnFixed.vue'
import HeaderComp from './Header.vue'
import RowDeleteComp from './RowDelete.vue'
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
const pkKindIsNumber = listConf.basic.columns.find(col => col.name === listConf.basic.pkColumnName)?.dataKind === DataKind.NUMBER

const columnsConf = computed<CachedColumnConf[]>(() => {
  return listConf.layout.columns.filter(column => !column.hide).map((column) => {
    return {
      ...column,
      ...listConf.basic.columns.find(col => col.name === column.name)!,
    }
  })
})

const rowMenuCompRef = ref()

function showRowContextMenu(event: MouseEvent) {
  rowMenuCompRef.value.show(event)
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
        :columns-conf="columnsConf" :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"
        :open-context-menu-fun="showRowContextMenu"
      />
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
          :records="groupData.records" :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf"
          :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"
          :open-context-menu-fun="showRowContextMenu"
        />
      </template>
    </template>
    <CellFillComp
      :columns-conf="columnsConf" :data="listConf.layout.data!"
      :pk-column-name="listConf.basic.pkColumnName"
    />
    <CellEditComp
      :columns-conf="columnsConf" :data="listConf.layout.data!"
      :pk-column-name="listConf.basic.pkColumnName"
    />
  </div>
  <MenuComp ref="rowMenuCompRef">
    <RowDeleteComp v-if="selectedDataPks.length > 0" :selected-pks="selectedDataPks" />
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
