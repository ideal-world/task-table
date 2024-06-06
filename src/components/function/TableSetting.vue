<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import type { TableBasicConf } from '../conf'
import ResizeSettingComp from './ResizeSetting.vue'
import ThemeSettingComp from './ThemeSetting.vue'

const props = defineProps<{
  basicConf: TableBasicConf
}>()

const tableSettingCompRef = ref<InstanceType<typeof MenuComp>>()
</script>

<template>
  <a class="cursor-pointer"><i :class="iconSvg.MORE" @click="(e) => { tableSettingCompRef?.show(e, MenuOffsetKind.RIGHT_TOP) }" /></a>
  <MenuComp ref="tableSettingCompRef">
    <div class="iw-divider m-1" />
    <ResizeSettingComp :size="props.basicConf.styles.size" :styles="props.basicConf.styles" />
    <ThemeSettingComp :styles="props.basicConf.styles" />
  </MenuComp>
</template>
