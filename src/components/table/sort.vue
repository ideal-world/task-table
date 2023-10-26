<script setup lang="ts">
import { onMounted } from 'vue'
import { TableColumnConf } from './conf'
import Sortable from 'sortablejs'

const props = defineProps<{
  columnsConf: TableColumnConf[]
}>()

onMounted(() => {
  Sortable.create(document.getElementsByClassName('iw-table-header')[0], {
    draggable: '.iw-table-header-cell',
    // @ts-ignore
    onEnd: function (evt) {
      if (evt.oldIndex != evt.newIndex) {
        const column = props.columnsConf.splice(evt.oldIndex, 1)[0]
        props.columnsConf.splice(evt.newIndex, 0, column)
      }
    },
  })
})
</script>

<template></template>
