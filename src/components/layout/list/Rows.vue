<script setup lang="ts">
import dayjs from 'dayjs'
import { DATA_DICT_POSTFIX, DataKind } from '../../../props'
import type { CachedColumnConf, TableStyleConf } from '../../conf'
import RowTreeComp from '../../function/RowTree.vue'
import * as iconSvg from '../../../assets/icon'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  parentPkColumnName?: string
  tileAllData: boolean
  expandDataPks: any[]
  pkKindIsNumber: boolean
  columnsConf: CachedColumnConf[]
  stylesConf: TableStyleConf
  showSelectColumn: boolean
  actionColumnRender?: (record: { [key: string]: any }) => any
  setColumnStyles: (colIdx: number) => any
}>()
</script>

<template>
  <!-- 显示条件：平铺显示 OR 父列不存在 OR 当前行父ID不存在 OR 展开的子行不存在 -->
  <div
    v-for="(row, idx) in props.records"
    v-show="props.tileAllData || !props.parentPkColumnName || !row[props.parentPkColumnName] || props.expandDataPks.indexOf(row[props.parentPkColumnName]) !== -1"
    :key="row[props.pkColumnName]"
    :data-pk="row[props.pkColumnName]"
    :data-parent-pk="props.parentPkColumnName ? row[props.parentPkColumnName] : undefined"
    :class="`${props.stylesConf.rowClass} iw-list-row iw-list-data-row flex bg-base-100 border-b border-b-base-300 border-r border-r-base-300`"
  >
    <div
      v-if="props.showSelectColumn"
      :class="`${props.stylesConf.cellClass} iw-list-cell flex justify-center items-center bg-base-100 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :style="props.setColumnStyles(-1)"
    >
      <input type="checkbox" class="iw-list-select-cell__chk iw-checkbox iw-checkbox-xs">
    </div>
    <div
      :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-data-pk-cell flex items-center bg-base-100 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :data-column-name="props.pkColumnName" :style="props.setColumnStyles(0)"
    >
      <RowTreeComp
        v-if="!props.tileAllData && props.parentPkColumnName"
        :cur-data="row" :next-data="props.records[idx + 1]" :pk-kind-is-number="pkKindIsNumber" :pk-column-name="props.pkColumnName" :parent-pk-column-name="props.parentPkColumnName!" :expand-data-pks="expandDataPks"
      />
      <div> <i v-if="props.tileAllData && props.parentPkColumnName && row[props.parentPkColumnName]" :class="`${iconSvg.SUB}`" />{{ row[props.pkColumnName] }}</div>
    </div>
    <div
      v-for="(column, colIdx) in props.columnsConf.slice(1)" :key="column.name"
      :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-data-cell flex items-center bg-base-100 border-l border-l-base-300 ${column.wrap ? 'break-words flex-wrap' : 'whitespace-nowrap overflow-hidden text-ellipsis flex-nowrap'}`"
      :data-column-name="column.name" :style="props.setColumnStyles(colIdx + 1)"
    >
      <div v-if="column.render" v-html="column.render(row, column.name)" />
      <div v-else-if="column.dataKind === DataKind.DATE || column.dataKind === DataKind.TIME || column.dataKind === DataKind.DATETIME">
        {{ column.kindDateTimeFormat ? dayjs(row[column.name]).format(column.kindDateTimeFormat) : row[column.name] }}
      </div>
      <div v-else-if="!column.useDict">
        {{ row[column.name] }}
      </div>
      <div
        v-for="dictItem in row[column.name + DATA_DICT_POSTFIX]" v-else :key="dictItem.value"
        :data-value="dictItem.value"
        class="iw-badge iw-badge-outline pl-0.5 mb-0.5 mr-0.5"
        :style="`background-color: ${dictItem.color}`"
      >
        <div v-if="dictItem.avatar !== undefined" class="avatar">
          <div class="w-4 rounded-full">
            <img :src="dictItem.avatar">
          </div>
        </div>
        <span class="ml-1 whitespace-nowrap">{{ dictItem.title }}{{ dictItem.title !== dictItem.value ? `(${dictItem.value})` : '' }}</span>
      </div>
    </div>
    <div
      v-if="props.actionColumnRender"
      :class="`${props.stylesConf.cellClass} iw-list-cell flex justify-center items-center  bg-base-100 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :style="props.setColumnStyles(-2)"
      v-html="props.actionColumnRender(row)"
    />
  </div>
</template>

<style lang="css">
.iw-list-data-row--unselected {
  @apply bg-base-100;
}
</style>
