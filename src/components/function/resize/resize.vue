<script setup lang="ts">
import * as iconSvg from '../../../assets/icon'
import { SizeKind } from '../../props'

const props = defineProps<{
  size: SizeKind
}>()
const emit = defineEmits(['size'])

function setSize(size: SizeKind) {
  emit('size', size)
}
</script>

<template>
  <div class="iw-contextmenu__item w-full flex justify-between items-center">
    <i :class="iconSvg.SIZE + ' cursor-pointer pr-1 text-xs' + (props.size == SizeKind.MINI ? ' text-primary' : '')"
      @click="setSize(SizeKind.MINI)"></i>
    <i :class="iconSvg.SIZE + ' cursor-pointer pr-1 text-sm' + (props.size == SizeKind.SMALL ? ' text-primary' : '')"
      @click="setSize(SizeKind.SMALL)"></i>
    <i :class="iconSvg.SIZE + ' cursor-pointer pr-1 text-base' + (props.size == SizeKind.MEDIUM ? ' text-primary' : '')"
      @click="setSize(SizeKind.MEDIUM)"></i>
    <i :class="iconSvg.SIZE + ' cursor-pointer pr-1 text-lg' + (props.size == SizeKind.LARGE ? ' text-primary' : '')"
      @click="setSize(SizeKind.LARGE)"></i>
  </div>
</template>
