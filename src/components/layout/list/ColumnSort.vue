<script setup lang="ts">
import Sortable from 'sortablejs'
import { inject, onMounted } from 'vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_LAYOUT_TYPE } from '../../events'
import type { TableLayoutModifyProps } from '../../props'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
}>()
const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!

onMounted(() => {
  Sortable.create(document.getElementsByClassName('iw-list-header')[0] as HTMLElement, {
    draggable: '.iw-list-header-normal-cell',
    async onEnd(evt) {
      if (evt.oldIndex !== evt.newIndex) {
        const changedLayoutReq: TableLayoutModifyProps = {
          columnSortedNames: [props.columnsConf[evt.oldIndex!].name, props.columnsConf[evt.newIndex!].name],
        }
        await modifyLayoutFun(changedLayoutReq)
      }
    },
  })
})
</script>

<template>
  <div />
</template>
