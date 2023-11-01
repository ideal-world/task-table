<script setup lang="ts">
import { onMounted } from 'vue'
import { ListColumnConf } from './conf'
import Sortable from 'sortablejs'

const props = defineProps<{
  columnsConf: ListColumnConf[]
}>()

onMounted(() => {
  Sortable.create(document.getElementsByClassName('iw-list-header')[0] as HTMLElement, {
    draggable: '.iw-list-header-cell',
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
