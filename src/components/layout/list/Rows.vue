<script setup lang="ts">
import type { CachedColumnConf, TableStyleConf } from '../../conf'

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
        :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-data-cell flex items-center iw-list-data-row--unselected border-solid border-b border-b-base-300 border-l border-l-base-300 ${column.wrap ? 'break-words' : 'whitespace-nowrap overflow-hidden text-ellipsis'}`"
        :data-column-name="column.name" :style="props.setColumnStyles(colIdx)" @contextmenu.prevent="openContextMenuFun"
      >
        {{ row[column.name] }}
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
