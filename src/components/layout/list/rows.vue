<script setup lang="ts">
import { ref } from 'vue';
import { DataKind } from '../../props';
import { ListColumnConf, ListStyleConf } from './conf'
import MenuComp from '../../common/Menu.vue'
import RowDeleteComp from './RowDelete.vue'
import RowSelectComp from './RowSelect.vue'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  columnsConf: ListColumnConf[]
  stylesConf: ListStyleConf
  editable: boolean
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
  <div v-for="(row, rowIdx) in props.records" :key="row[props.pkColumnName]" :data-pk="row[props.pkColumnName]"
    :class="props.stylesConf.rowClass + ' iw-list-row iw-list-data-row flex border-r border-r-base-300 iw-list-data-row--unselected'">
    <template v-for="(column, colIdx) in props.columnsConf" :key="column.name">
      <div
        :class="props.stylesConf.cellClass + ' iw-list-cell iw-list-row-cell flex items-center border-solid border-b border-b-base-300 border-l border-l-base-300 ' + (column.wrap ? 'break-words' : 'whitespace-nowrap')"
        :data-column-name="column.name" :data-row-idx="rowIdx" :style="props.setColumnStyles(colIdx)"
        @contextmenu.prevent="showRowContextMenu">
        {{ row[column.name] }}
      </div>
    </template>
  </div>
  <menu-comp ref="rowMenuCompRef">
    <row-delete-comp :select-pks="selectedDataPks" v-show="props.editable && selectedDataPks.length > 0"></row-delete-comp>
  </menu-comp>
  <row-select-comp :select-pks="selectedDataPks" :pk-column-name="pkColumnName"
    :pk-kind-is-number="pkKindIsNumber"></row-select-comp>
</template>

<style lang="css">
.iw-list-data-row--unselected {
  @apply bg-base-100;
}
</style>
