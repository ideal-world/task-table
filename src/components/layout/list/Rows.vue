<script setup lang="ts">
import { ref } from 'vue'
import MenuComp from '../../common/Menu.vue'
import { CachedColumnConf, TableStyleConf } from '../../conf'
import { DataKind } from '../../props'
import RowDeleteComp from './RowDelete.vue'
import RowSelectComp from './RowSelect.vue'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  columnsConf: CachedColumnConf[]
  stylesConf: TableStyleConf
  setColumnStyles: (colIdx: number) => any
}>()

const selectedDataPks = ref<string[] | number[]>([])
const rowMenuCompRef = ref()
const pkKindIsNumber = props.columnsConf.find((col) => col.name == props.pkColumnName)?.dataKind == DataKind.NUMBER

const showRowContextMenu = (event: MouseEvent) => {
  rowMenuCompRef.value.show(event)
}

</script>

<template>
  <div v-for="(row) in props.records" :key="row[props.pkColumnName]" :data-pk="row[props.pkColumnName]"
    :class="props.stylesConf.rowClass + ' iw-list-row iw-list-data-row flex border-r border-r-base-300'">
    <template v-for="(column,colIdx) in props.columnsConf" :key="column.name">
      <div
        :class="props.stylesConf.cellClass + ' iw-list-cell iw-list-data-cell flex items-center iw-list-data-row--unselected border-solid border-b border-b-base-300 border-l border-l-base-300 ' + (column.wrap ? 'break-words' : 'whitespace-nowrap overflow-hidden text-ellipsis')"
        :data-column-name="column.name" :style="props.setColumnStyles(colIdx)" @contextmenu.prevent="showRowContextMenu">
        {{ row[column.name] }}
      </div>
    </template>
    <div
        :class="props.stylesConf.cellClass + ' iw-list-cell iw-list-data-cell flex items-center iw-list-data-row--unselected border-solid border-b border-b-base-300 border-l border-l-base-300 '"
        :style="props.setColumnStyles(-1)"
      >
      </div>
  </div>
  <menu-comp ref="rowMenuCompRef">
    <row-delete-comp :selected-pks="selectedDataPks" v-show="selectedDataPks.length > 0"></row-delete-comp>
  </menu-comp>
  <row-select-comp :selected-pks="selectedDataPks" :pk-column-name="pkColumnName"
    :pk-kind-is-number="pkKindIsNumber"></row-select-comp>
</template>

<style lang="css">
.iw-list-data-row--unselected {
  @apply bg-base-100;
}
</style>
