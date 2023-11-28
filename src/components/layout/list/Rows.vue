<script setup lang="ts">
import type { CachedColumnConf, TableStyleConf } from '../../conf'
import { DATA_DICT_POSTFIX } from '../../props'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  columnsConf: CachedColumnConf[]
  stylesConf: TableStyleConf
  setColumnStyles: (colIdx: number) => any
  openContextMenuFun: (event: MouseEvent) => void
}>()
</script>

<template>
  <div
    v-for="(row) in props.records" :key="row[props.pkColumnName]" :data-pk="row[props.pkColumnName]"
    :class="`${props.stylesConf.rowClass} iw-list-row iw-list-data-row flex border-r border-r-base-300`"
  >
    <template v-for="(column, colIdx) in props.columnsConf" :key="column.name">
      <div
        :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-data-cell flex items-center iw-list-data-row--unselected border-solid border-b border-b-base-300 border-l border-l-base-300 ${column.wrap ? 'break-words flex-wrap' : 'whitespace-nowrap overflow-hidden text-ellipsis flex-nowrap'}`"
        :data-column-name="column.name" :style="props.setColumnStyles(colIdx)" @contextmenu.prevent="openContextMenuFun"
      >
        <template v-if="!column.useDict">
          {{ row[column.name] }}
        </template>
        <template v-else>
          <div
            v-for="dictItem in row[column.name + DATA_DICT_POSTFIX]" :key="dictItem.value" :data-value="dictItem.value"
            class="badge badge-outline pl-0.5 mb-0.5"
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
    <div
      :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-data-cell flex items-center iw-list-data-row--unselected border-solid border-b border-b-base-300 border-l border-l-base-300 `"
      :style="props.setColumnStyles(-1)"
    />
  </div>
</template>

<style lang="css">
.iw-list-data-row--unselected {
  @apply bg-base-100;
}
</style>
