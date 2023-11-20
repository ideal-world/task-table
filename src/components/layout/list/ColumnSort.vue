<script setup lang="ts">
import Sortable from 'sortablejs'
import { inject, onMounted } from 'vue'
import { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_LAYOUT_TYPE } from '../../events'
import { TableLayoutModifyReq } from '../../props'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
}>()
const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!

onMounted(() => {
  Sortable.create(document.getElementsByClassName('iw-list-header')[0] as HTMLElement, {
    draggable: '.iw-list-header-cell',
    onEnd: async function (evt) {
      if (evt.oldIndex != evt.newIndex) {
        const changedLayoutReq: TableLayoutModifyReq = {
          columnSortedNames: [props.columnsConf[evt.oldIndex!].name, props.columnsConf[evt.newIndex!].name]
        }
        await modifyLayoutFun(changedLayoutReq)
      }
    },
  })
})
</script>

<template></template>
