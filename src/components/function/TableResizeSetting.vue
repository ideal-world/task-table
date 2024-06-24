<script setup lang="ts">
import * as iconSvg from '../../assets/icon';
import type { TableStyleModifyProps, TableStyleProps } from '../../props';
import { SizeKind } from '../../props';
import * as eb from '../eventbus';

const props = defineProps<{
  // 表格样式
  // Table style
  styles: TableStyleProps
  // 表格大小
  // Table size
  size: SizeKind
}>()

async function setSize(newSize: SizeKind) {
  const tableStyleConf: TableStyleModifyProps = {
    size: newSize,
  }
  await eb.modifyStyles(tableStyleConf)
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
