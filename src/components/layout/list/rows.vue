<script setup lang="ts">
import { ref } from 'vue';
import { DataKind } from '../../props';
import { ListColumnConf, ListStyleConf } from './conf';
import MenuComp from '../../common/menu.vue'
import DeleteComp from './delete.vue'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  columnsConf: ListColumnConf[]
  stylesConf: ListStyleConf
  editable: boolean
  setColumnStyles: (colIdx: number) => any
}>()

const selectedDataPks = ref<string[] | number[] | undefined>()
const rowMenuCompRef = ref()

const showRowContextMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const selectedRowEle = targetEle.parentElement as HTMLElement
  if (props.columnsConf.find((col) => col.name == props.pkColumnName)?.dataKind == DataKind.NUMBER) {
    selectedDataPks.value = [parseInt(selectedRowEle.dataset.pk as string)]
  } else {
    selectedDataPks.value = [selectedRowEle.dataset.pk as string]
  }
  rowMenuCompRef.value.show(event)
}

</script>

<template>
  <div v-for="(row, rowIdx) in props.records" :key="row[props.pkColumnName]" :data-pk="row[props.pkColumnName]"
    :class="props.stylesConf.rowClass + ' iw-list-row flex border-r border-r-base-300'">
    <template v-for="(column, colIdx) in props.columnsConf" :key="column.name">
      <div
        :class="props.stylesConf.cellClass + ' iw-list-cell iw-list-row-cell flex items-center bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 hover:bg-base-200 ' + (column.wrap ? 'break-words' : 'whitespace-nowrap')"
        :data-column-name="column.name" :data-row-idx="rowIdx" :style="props.setColumnStyles(colIdx)"
        @contextmenu.prevent="showRowContextMenu">
        {{ row[column.name] }}
      </div>
    </template>
  </div>
  <menu-comp ref="rowMenuCompRef">
    <delete-comp :select-pks="selectedDataPks" v-show="props.editable"></delete-comp>
  </menu-comp>
</template>