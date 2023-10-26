<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { TableColumnConf } from './conf'
import Sortable from 'sortablejs'

const props = defineProps<{
  currentColIdx: number
  columnsConf: TableColumnConf[]
}>()

const columnsConf = reactive<TableColumnConf[]>(props.columnsConf)

onMounted(() => {
  const sortable = Sortable.create(document.getElementsByClassName('iw-table-header')[0],{
    onChoose: function (/**Event*/evt) {
		evt.oldIndex;  // element index within parent
	},
  })
})
</script>

<template></template>
