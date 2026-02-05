<script lang="ts" setup>
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import MenuComp from '../../common/Menu.vue'
import * as iconSvg from '../../../assets/icon'
import { NODE_DEPTH_FLAG, sortByTree } from '../../function/RowTree'
import {
  hasSubDataFn,
  registerTreeArrowToggleListener,
  treeFieldOption,
} from './utils'

const props = defineProps<{
  options: any[] | undefined
  values: any
  filterValue?: string | undefined
}>()
const emits = defineEmits(['click'])
const treeRef: Ref<HTMLDivElement | null> = ref(null)
const dictTreeContainerCompRef = ref<InstanceType<typeof MenuComp>>(
  {} as InstanceType<typeof MenuComp>,
)
const treeOptions = ref<any[]>([])

const isFunctionExecuted = ref<boolean>(true)

watch(
  () => props.options,
  () => {
    addLevelDataFn(props.options)
  },
)
function addLevelDataFn(data: any) {
  treeOptions.value = data
    ? hasSubDataFn(sortByTree(data, treeFieldOption.no, treeFieldOption.pno))
    : []
}

function handleShow(
  ...args: Parameters<typeof dictTreeContainerCompRef.value.show>
) {
  setTimeout(() => {
    if (isFunctionExecuted.value) {
      isFunctionExecuted.value = false
      registerTreeArrowToggleListener(treeRef.value!)
    }
  })
  return dictTreeContainerCompRef.value?.show(...args)
}
function handleClose(
  ...args: Parameters<typeof dictTreeContainerCompRef.value.close>
) {
  return dictTreeContainerCompRef.value?.close(...args)
}

function isShow() {
  return dictTreeContainerCompRef.value?.isShow
}

function handleClick(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }
  const arrowEle = e.target.closest('.icon-tree-arrow')
  if (arrowEle) {
    return
  }
  emits('click', e)
}

defineExpose({
  show: handleShow,
  close: handleClose,
  isShow,
})
</script>

<template>
  <MenuComp ref="dictTreeContainerCompRef" class="p2">
    <div ref="treeRef" class="iw-tree__container w-full" @click="handleClick">
      <div
        v-for="dictItem in treeOptions"
        :key="`${dictItem.value}`"
        :style="`background-color: ${dictItem.color}; display: ${
          dictItem.pno && !filterValue ? 'none' : 'flex'
        }`"
        class="iw-contextmenu__item flex items-center cursor-pointer hover:bg-gray-200 m-1.5 pl-0.5"
        :class="values?.includes(dictItem.value) ? 'tree-item-active' : ''"
        :data-pk="dictItem[treeFieldOption.no]"
        :data-parent-pk="dictItem[treeFieldOption.pno] ?? undefined"
        :data-value="dictItem.value"
        :data-title="dictItem.title"
        :data-color="dictItem.color"
      >
        <!-- <div v-if="dictItem.avatar !== undefined" class="avatar">
          <img :src="dictItem.avatar" class="w-4 rounded-full">
        </div> -->
        <div
          :style="{ width: `${15 * (dictItem[NODE_DEPTH_FLAG] + 1)}px` }"
          class="flex items-center justify-end"
        >
          <i
            v-if="dictItem.hasSub"
            :class="`icon-tree-arrow block ${!filterValue && '-rotate-90'} ${iconSvg.SHRINK}`"
          />
        </div>
        <span
          class="ml-1 whitespace-nowrap" :class="[{ 'border-b-2': dictItem.filter }]"
        >{{ dictItem.title }}</span>
      </div>
    </div>
  </MenuComp>
</template>

<style scoped>
.iw-tree__container .tree-item-active {
  background-color: var(--fallback-p, oklch(var(--p) / 1));
  background-color: var(--sys-primary);
}
.iw-tree__container .tree-item-active span {
  color: #fff;
}
</style>
