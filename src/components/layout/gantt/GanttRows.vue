<script setup lang="ts">
import dayjs from 'dayjs'
import * as iconSvg from '../../../assets/icon'
import type { LayoutKind } from '../../../props'
import { DATA_DICT_POSTFIX, DataKind, SubDataShowKind } from '../../../props'

import type { CachedColumnConf, TableStyleConf } from '../../conf'
import { NODE_DEPTH_FLAG, renderTreeToggleHandler } from '../../function/RowTree'
import type { GanttInfo } from './gantt'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  parentPkColumnName?: string
  subDataShowKind: SubDataShowKind
  pkKindIsNumber: boolean
  columnsConf: CachedColumnConf[]
  layoutId: string
  layoutKind: LayoutKind
  stylesConf: TableStyleConf
  showSelectColumn: boolean
  ganttInfo: GanttInfo
  setColumnStyles: (colIdx: number) => any
  setListWidth: () => any
}>()
</script>

<template>
  <div
    class="flex justify-between"
  >
    <div class="overflow-auto" :style="props.setColumnStyles(-2)">
      <div
        v-for="(row, idx) in props.records"
        :key="`${layoutId}-${row[props.pkColumnName]}-${props.subDataShowKind}`"
        :data-pk="row[props.pkColumnName] "
        :data-parent-pk="props.parentPkColumnName ? row[props.parentPkColumnName] : undefined"
        :class="`${props.stylesConf.rowClass} iw-gantt-row iw-data-row ${props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? 'iw-data-fold' : ''} flex bg-base-100 border-b border-b-base-300 border-r border-r-base-300`"
        :style="props.setListWidth()"
      >
        <div
          v-if="props.showSelectColumn"
          :class="`${props.stylesConf.cellClass} iw-gantt-cell flex justify-center items-center bg-base-100 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
          :style="props.setColumnStyles(-1)"
        >
          <input type="checkbox" class="iw-row-select-cell__chk iw-checkbox iw-checkbox-xs">
        </div>
        <div
          :class="`${props.stylesConf.cellClass} iw-gantt-cell iw-data-cell flex items-center bg-base-100 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
          :data-column-name="props.pkColumnName" :style="{ ...props.columnsConf[0].styles, ...props.setColumnStyles(0) }"
        >
          <div v-if="props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA && props.parentPkColumnName" class="flex justify-end" :style="{ width: `${15 * (row[NODE_DEPTH_FLAG] + 1)}px` }" v-html="renderTreeToggleHandler(props.records[idx + 1] && row[props.pkColumnName] === props.records[idx + 1][props.parentPkColumnName])" />
          <i v-else-if="props.subDataShowKind === SubDataShowKind.TILE_ALL_DATA && props.parentPkColumnName && row[props.parentPkColumnName]" :class="`${iconSvg.SUB}`" />
          {{ row[props.pkColumnName] }}
        </div>
        <div
          v-for="(column, colIdx) in props.columnsConf.slice(1)" :key="`${props.layoutId}-${column.name}`"
          :class="`${props.stylesConf.cellClass} iw-gantt-cell iw-data-cell flex items-center bg-base-100 border-l border-l-base-300 ${column.wrap ? 'break-words flex-wrap' : 'whitespace-nowrap overflow-hidden text-ellipsis flex-nowrap'}`"
          :data-column-name="column.name" :style="{ ...column.styles, ...props.setColumnStyles(colIdx + 1) }"
        >
          <div v-if="column.render" v-html="column.render(row, props.layoutKind)" />
          <div v-else-if="column.dataKind === DataKind.DATE || column.dataKind === DataKind.TIME || column.dataKind === DataKind.DATETIME">
            {{ column.kindDateTimeFormat ? dayjs(row[column.name]).format(column.kindDateTimeFormat) : row[column.name] }}
          </div>
          <div v-else-if="!column.useDict">
            {{ row[column.name] }}
          </div>
          <div
            v-for="dictItem in row[column.name + DATA_DICT_POSTFIX]" v-else :key="`${column.name}-${dictItem.value}`"
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
      </div>
    </div>
  </div>
</template>

<style lang="css">
.iw-data-row--unselected {
  @apply bg-base-100;
}
</style>
