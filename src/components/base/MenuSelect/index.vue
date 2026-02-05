<script lang="ts" setup>
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import MenuComp from '../../common/Menu.vue'

const props = defineProps<{
  options: any[] | undefined
  values: any
}>()
const emits = defineEmits(['click'])
const menuSelectRef = ref<InstanceType<typeof MenuComp>>(
  {} as InstanceType<typeof MenuComp>,
)
const selectOptions = ref<any[]>([])

watch(
  () => props.options,
  () => {
    selectOptions.value = props.options || []
  },
)

function handleShow(
  ...args: Parameters<typeof menuSelectRef.value.show>
) {
  return menuSelectRef.value?.show(...args)
}
function handleClose(
  ...args: Parameters<typeof menuSelectRef.value.close>
) {
  return menuSelectRef.value?.close(...args)
}

function isShow() {
  return menuSelectRef.value?.isShow
}

function handleClick(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
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
  <MenuComp ref="menuSelectRef" class="p2">
    <div class="iw-tree__container w-full" @click="handleClick">
      <div
        v-for="dictItem in selectOptions"
        :key="`${dictItem.value}`"
        :style="`color: ${dictItem.color}; display: ${
          dictItem.pno ? 'none' : 'flex'
        }`"
        class="iw-contextmenu__item flex items-center m-1.5 pl-0.5"
        :class="[values?.includes(dictItem.value) ? 'tree-item-active' : '',
                 dictItem.disable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-200',
        ]"
        :data-value="dictItem.value"
        :data-title="dictItem.title"
        :data-color="dictItem.color"
        :data-disable="dictItem.disable"
      >
        <!-- <div v-if="dictItem.avatar !== undefined" class="avatar">
          <img :src="dictItem.avatar" class="w-4 rounded-full">
        </div> -->
        <div v-if="dictItem.icon !== undefined">
          <i :class="`${dictItem.icon} mr-0.5`" />
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
