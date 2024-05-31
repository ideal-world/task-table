<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { TableStyleConf } from '../conf'
import { FUN_MODIFY_STYLES_TYPE } from '../events'
import { SizeKind } from '../../props'

const props = defineProps<{
  styles: TableStyleConf
  size: SizeKind
}>()
const modifyStyleFun = inject(FUN_MODIFY_STYLES_TYPE)!

async function setSize(newSize: SizeKind) {
  const tableStyleConf: TableStyleConf = {
    ...props.styles,
    size: newSize,
  }
  await modifyStyleFun(tableStyleConf)
}
</script>

<template>
  <div class="iw-contextmenu__item w-full flex justify-between items-center">
    <i
      :class="`${iconSvg.SIZE} cursor-pointer pr-1 text-xs${props.size === SizeKind.MINI ? ' text-primary' : ''}`"
      @click="setSize(SizeKind.MINI)"
    />
    <i
      :class="`${iconSvg.SIZE} cursor-pointer pr-1 text-sm${props.size === SizeKind.SMALL ? ' text-primary' : ''}`"
      @click="setSize(SizeKind.SMALL)"
    />
    <i
      :class="`${iconSvg.SIZE} cursor-pointer pr-1 text-base${props.size === SizeKind.MEDIUM ? ' text-primary' : ''}`"
      @click="setSize(SizeKind.MEDIUM)"
    />
    <i
      :class="`${iconSvg.SIZE} cursor-pointer pr-1 text-lg${props.size === SizeKind.LARGE ? ' text-primary' : ''}`"
      @click="setSize(SizeKind.LARGE)"
    />
  </div>
</template>
