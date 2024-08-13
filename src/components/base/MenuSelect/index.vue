<template>
  <MenuComp ref="dictContainerCompRef" class="p2">
    <div ref="SelectRef" @click="handleClick" class="iw-tree__container w-full">
      <div
        v-for="dictItem in selectOptions"
        :key="`${dictItem.value}`"
        :style="`color: ${dictItem.color}; display: ${
          dictItem.pno ? 'none' : 'flex'
        }`"
        class="iw-contextmenu__item flex items-center cursor-pointer hover:bg-gray-200 m-1.5 pl-0.5"
        :class="values?.includes(dictItem.value) ? 'tree-item-active' : ''"
        :data-value="dictItem.value"
        :data-title="dictItem.title"
        :data-avatar="dictItem.avatar"
        :data-color="dictItem.color"
      >
        <div v-if="dictItem.avatar !== undefined" class="avatar">
          <img :src="dictItem.avatar" class="w-4 rounded-full" />
        </div>
        <span
          :class="['ml-1 whitespace-nowrap', { 'border-b-2': dictItem.filter }]"
          >{{ dictItem.title }}</span
        >
      </div>
    </div>
  </MenuComp>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import MenuComp from '../../common/Menu.vue'
const props = defineProps<{
  options: any[] | undefined
  values: any
  setFilterADictValue: (e: Event) => void
}>()
const treeRef: Ref<HTMLDivElement | null> = ref(null)
const dictContainerCompRef = ref<InstanceType<typeof MenuComp>>(
  {} as InstanceType<typeof MenuComp>
)
const selectOptions = ref<any[]>([])

watch(
  () => props.options,
  () => {
    selectOptions.value = props.options || []
  }
)


function handleShow(
  ...args: Parameters<typeof dictContainerCompRef.value.show>
) {
  return dictContainerCompRef.value?.show(...args)
}
function handleClose(
  ...args: Parameters<typeof dictContainerCompRef.value.close>
) {
  return dictContainerCompRef.value?.close(...args)
}

function handleClick(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }
  props.setFilterADictValue(e)
}

defineExpose({
  show: handleShow,
  close: handleClose
})
</script>
<style scoped>
.iw-tree__container .tree-item-active {
  background-color: var(--fallback-p, oklch(var(--p) / 1));
  background-color: color-mix(in oklch, var(--sys-primary), transparent 10%);
}
.iw-tree__container .tree-item-active span {
  color: #fff;
}
</style>
