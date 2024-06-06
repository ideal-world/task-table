<script setup lang="ts">
import dayjs from 'dayjs'
import * as iconSvg from '../../../assets/icon'
import { DATA_DICT_POSTFIX, DataKind, SubDataShowKind } from '../../../props'

import type { CachedColumnConf, TableStyleConf } from '../../conf'
import { NODE_DEPTH_FLAG, renderTreeToggleHandler } from '../../function/RowTree'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  parentPkColumnName?: string
  subDataShowKind: SubDataShowKind
  pkKindIsNumber: boolean
  columnsConf: CachedColumnConf[]
  stylesConf: TableStyleConf
  showSelectColumn: boolean
  actionColumnRender?: (record: { [key: string]: any }) => any
  setColumnStyles: (colIdx: number) => any
}>()
</script>

<template>
  <!-- key的值使用主键+子数据显示类型以确保子数据显示类型切换时可以重新创建所有行。
  否则，折叠行时MutationObserver处理会遗漏一些需要隐藏的子数据。

  The value of key uses primary key + sub-data display kind to ensure that all rows can be recreated when the sub-data display kind is switched.
  Otherwise, MutationObserver processing when collapsing rows will miss some sub-data that needs to be hidden.
-->
  <div
    v-for="(row, idx) in props.records"
    :key="row[props.pkColumnName] + props.subDataShowKind"
    :data-pk="row[props.pkColumnName] "
    :data-parent-pk="props.parentPkColumnName ? row[props.parentPkColumnName] : undefined"
    :class="`${props.stylesConf.rowClass} iw-list-row iw-list-data-row ${props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? 'iw-list-data-fold' : ''} flex bg-base-100 border-b border-b-base-300 border-r border-r-base-300`"
  >
    <div
      v-if="props.showSelectColumn"
      :class="`${props.stylesConf.cellClass} iw-list-cell flex justify-center items-center bg-base-100 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :style="props.setColumnStyles(-1)"
    >
      <input type="checkbox" class="iw-list-select-cell__chk iw-checkbox iw-checkbox-xs">
    </div>
    <div
      :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-data-cell flex items-center bg-base-100 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :data-column-name="props.pkColumnName" :style="props.setColumnStyles(0)"
    >
      <div v-if="props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA && props.parentPkColumnName" class="flex justify-end" :style="{ width: `${15 * (row[NODE_DEPTH_FLAG] + 1)}px` }" v-html="renderTreeToggleHandler(props.records[idx + 1] && row[props.pkColumnName] === props.records[idx + 1][props.parentPkColumnName])" />
      <i v-else-if="props.subDataShowKind === SubDataShowKind.TILE_ALL_DATA && props.parentPkColumnName && row[props.parentPkColumnName]" :class="`${iconSvg.SUB}`" />
      {{ row[props.pkColumnName] }}
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
      :class="`${props.stylesConf.cellClass} iw-list-cell flex justify-center items-center bg-base-100 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
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
