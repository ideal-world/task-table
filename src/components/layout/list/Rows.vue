<script setup lang="ts">
import dayjs from 'dayjs'
import { DATA_DICT_POSTFIX, DataKind } from '../../../props'
import type { CachedColumnConf, TableStyleConf } from '../../conf'
import RowTreeComp from '../../function/RowTree.vue'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  parentPkColumnName?: string
  expandDataPks: any[]
  pkKindIsNumber: boolean
  columnsConf: CachedColumnConf[]
  stylesConf: TableStyleConf
  setColumnStyles: (colIdx: number) => any
}>()
</script>

<template>
  <template v-for="(row, idx) in props.records" :key="row[props.pkColumnName]">
    <div
      v-show="!props.parentPkColumnName || !row[props.parentPkColumnName] || props.expandDataPks.indexOf(row[props.parentPkColumnName]) !== -1"
      :data-pk="row[props.pkColumnName]"
      :data-parent-pk="props.parentPkColumnName ? row[props.parentPkColumnName] : undefined"
      :class="`${props.stylesConf.rowClass} iw-list-row iw-list-data-row flex border-r border-r-base-300`"
    >
      <div
        :class="`${props.stylesConf.cellClass} iw-list-cell flex justify-center items-center iw-list-data-row--unselected border-solid border-b border-b-base-300 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
        :style="props.setColumnStyles(-1)"
      >
        <input type="checkbox" class="iw-list-select-cell__chk iw-checkbox iw-checkbox-sm">
      </div>
      <div
        :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-data-pk-cell flex items-center iw-list-data-row--unselected border-solid border-b border-b-base-300 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
        :data-column-name="props.pkColumnName" :style="props.setColumnStyles(0)"
      >
        <RowTreeComp v-if="props.parentPkColumnName" :cur-data="row" :next-data="props.records[idx + 1]" :pk-kind-is-number="pkKindIsNumber" :pk-column-name="props.pkColumnName" :parent-pk-column-name="props.parentPkColumnName!" :expand-data-pks="expandDataPks" />
        <div>{{ row[props.pkColumnName] }}</div>
      </div>
      <template v-for="(column, colIdx) in props.columnsConf.slice(1)" :key="column.name">
        <div
          :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-data-cell flex items-center iw-list-data-row--unselected border-solid border-b border-b-base-300 border-l border-l-base-300 ${column.wrap ? 'break-words flex-wrap' : 'whitespace-nowrap overflow-hidden text-ellipsis flex-nowrap'}`"
          :data-column-name="column.name" :style="props.setColumnStyles(colIdx + 1)"
        >
          <template v-if="column.render">
            <div v-html="column.render(row, column.name)" />
          </template>
          <template v-else-if="column.dataKind === DataKind.DATE || column.dataKind === DataKind.TIME || column.dataKind === DataKind.DATETIME">
            <div>{{ column.kindDateTimeFormat ? dayjs(row[column.name]).format(column.kindDateTimeFormat) : row[column.name] }}</div>
          </template>
          <template v-else-if="!column.useDict">
            <div>{{ row[column.name] }}</div>
          </template>
          <template v-else>
            <div
              v-for="dictItem in row[column.name + DATA_DICT_POSTFIX]" :key="dictItem.value" :data-value="dictItem.value"
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
          </template>
        </div>
      </template>
    </div>
  </template>
</template>

<style lang="css">
.iw-list-data-row--unselected {
  @apply bg-base-100;
}
</style>
