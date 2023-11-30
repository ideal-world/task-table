<script setup lang="ts">
import { inject, ref } from 'vue';
import * as iconSvg from '../../../assets/icon';
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue';
import { FUN_ADD_DATA_TYPE } from '../../events';

const props = defineProps<{
  pkColumnName: string
  selectedPks: string[] | number[]
}>()

const addDataFun = inject(FUN_ADD_DATA_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

const copiedPks = ref<string[] | number[]>([])

async function copyAndPasteRow() {
  await addDataFun(props.selectedPks.slice().map((pk) => {
    return {
      [props.pkColumnName]: pk,
    }
  }), props.selectedPks[props.selectedPks.length - 1])
  closeContextMenuFun()
}

function copyRow() {
  copiedPks.value = props.selectedPks.slice()
  closeContextMenuFun()
}

async function pasteRow() {
  await addDataFun(copiedPks.value.slice().map((pk) => {
    return {
      [props.pkColumnName]: pk,
    }
  }), props.selectedPks[props.selectedPks.length - 1])
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer text-sm" @click="copyAndPasteRow">
    <i :class="iconSvg.COPY" /> {{ $t('list.rowCopyPaste.copyAndPasteTitle') }}
  </div>
  <div class="iw-contextmenu__item cursor-pointer text-sm" @click="copyRow">
    <i :class="iconSvg.COPY" /> {{ $t('list.rowCopyPaste.copyTitle') }}
  </div>
  <div v-if="copiedPks.length > 0" class="iw-contextmenu__item cursor-pointer text-sm" @click="pasteRow">
    <i :class="iconSvg.PASTE" /> {{ $t('list.rowCopyPaste.pasteTitle') }}
  </div>
</template>
