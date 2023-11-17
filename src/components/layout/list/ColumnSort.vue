<script setup lang="ts">
import Sortable from 'sortablejs';
import { inject, onMounted } from 'vue';
import { FN_MODIFY_LAYOUT } from '../../../constant';
import { CachedColumnConf } from '../../conf';
import { TableLayoutModifyReq } from '../../props';

const props = defineProps<{
  columnsConf: CachedColumnConf[]
}>()
const modifyLayoutFun = inject(FN_MODIFY_LAYOUT)

onMounted(() => {
  Sortable.create(document.getElementsByClassName('iw-list-header')[0] as HTMLElement, {
    draggable: '.iw-list-header-cell',
    // @ts-ignore
    onEnd: async function (evt) {
      if (evt.oldIndex != evt.newIndex) {
        const changedLayoutReq: TableLayoutModifyReq = {
          columnSortedNames: [props.columnsConf[evt.oldIndex!].name, props.columnsConf[evt.newIndex!].name]
        }
        // @ts-ignore
        await modifyLayoutFun(changedLayoutReq)
      }
    },
  })
})
</script>

<template></template>
