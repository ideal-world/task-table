<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/menu.vue'
import { SizeKind } from '../props'

const props = defineProps<{
  size: SizeKind
}>()
const emit = defineEmits(['size'])

const menuCompRef = ref()

const showMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const selectedLayoutEle = targetEle.parentElement as HTMLElement
  menuCompRef.value.show(selectedLayoutEle, MenuOffsetKind.RIGHT_BOTTOM, MenuSizeKind.SMALL)
}

function setSize(size: SizeKind) {
  emit('size', size)
  // @ts-ignore
  menuCompRef.value.close()
}
</script>

<template>
  <div className="iw-tools-size" @click="showMenu" :title="$t('tools.size.title')"><svg v-html="iconSvg.SIZE"></svg></div>
  <menu-comp ref="menuCompRef">
    <div class="iw-contextmenu__item iw-tools-size-items">
      <svg
        v-html="iconSvg.SIZE"
        @click="setSize(SizeKind.MINI)"
        :class="props.size == SizeKind.MINI ? 'iw-tools-size-items--active' : ''"
        style="width: 0.8em; height: 0.8em; padding-right: 3px"
      ></svg>
      <svg
        v-html="iconSvg.SIZE"
        @click="setSize(SizeKind.SMALL)"
        :class="props.size == SizeKind.SMALL ? 'iw-tools-size-items--active' : ''"
        style="width: 1em; height: 1em; padding-right: 3px"
      ></svg>
      <svg
        v-html="iconSvg.SIZE"
        @click="setSize(SizeKind.MEDIUM)"
        :class="props.size == SizeKind.MEDIUM ? 'iw-tools-size-items--active' : ''"
        style="width: 1.2em; height: 1.2em; padding-right: 3px"
      ></svg>
      <svg
        v-html="iconSvg.SIZE"
        @click="setSize(SizeKind.LARGE)"
        :class="props.size == SizeKind.LARGE ? 'iw-tools-size-items--active' : ''"
        style="width: 1.5em; height: 1.5em"
      ></svg>
    </div>
  </menu-comp>
</template>

<style lang="scss" scoped>
@import '../../assets/main.scss';

@include b('tools-size-items') {
  @include m('active') {
    color: var(--el-color-primary-light-3);
  }
}
</style>
