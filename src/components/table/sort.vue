<script setup lang="ts">
import { onMounted } from 'vue'
import { TableColumnConf } from './conf'
import Sortable from 'sortablejs'

const props = defineProps<{
  columnsConf: TableColumnConf[]
}>()

onMounted(() => {
  Sortable.create(document.getElementsByClassName('iw-table-header')[0] as HTMLElement, {
    draggable: '.iw-table-header-cell',
    // @ts-ignore
    onEnd: function (evt) {
      if (evt.oldIndex != evt.newIndex) {
        // @ts-ignore
        const column = props.columnsConf.splice(evt.oldIndex, 1)[0]
        // @ts-ignore
        props.columnsConf.splice(evt.newIndex, 0, column)
      }
    },
  })
})
</script>

<template></template>
