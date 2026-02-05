<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { DataKind, getInputTypeByDataKind } from '../../../props/enumProps'
import Badge from '../../common/Badge.vue'

const props = defineProps<{
  // 过滤项
  filterItem?: any
  // 过滤项的索引
  filterItemIdx?: number
  // 已筛选项
  options: any[]
  showDictItems: Function
  deleteAValue: Function
  // label宽度
  width?: number
  disabled?: boolean
}>()

defineEmits(['deleteAValue'])

const MInputRef = ref()

const labelWidth = computed(() => {
  return MInputRef.value?.offsetWidth || 0
})
const selectedBoxWidth = computed(() => labelWidth.value * 0.7)
// 观察器
const selectedObserver = ref()
const selectedBoxRef = ref()
// 是否显示缩略badge
const showBreviary = ref(false)
// 缩略时显示的个数
const showCount = ref(0)
// 缩略的个数
const breviaryCount = computed(() => props.options.length - showCount.value)
// 字典值输入框引用
// Dictionary value input box reference
const inputRef = ref<InstanceType<typeof HTMLInputElement>>()
const isComposing = ref(false)

onMounted(() => {
  selectedObserver.value = new ResizeObserver(() => {
    // 有缩略个数时不进入下面的判断
    if (showCount.value && breviaryCount.value > 0)
      return

    if (selectedBoxRef.value.offsetWidth > labelWidth.value) {
      const items = document.querySelectorAll('.selected-item')
      let inputItemsWidth = 0
      let inputCount = 0
      while (inputItemsWidth < selectedBoxWidth.value) {
        if (!(items[inputCount] as HTMLElement)?.offsetWidth) {
          return
        }
        inputItemsWidth += (items[inputCount] as HTMLElement)?.offsetWidth
        inputCount++
      }
      showBreviary.value = true
      // showCount.value = props.options.length - items.length > 1 ? inputCount : 1
      showCount.value = inputCount - 1
    }
    else {
      showBreviary.value = false
      showCount.value = 0
    }
  })
  selectedObserver.value?.observe(selectedBoxRef.value)

  inputRef.value?.addEventListener('compositionstart', (_e) => {
    isComposing.value = true
  })
  inputRef.value?.addEventListener('compositionend', (_e) => {
    isComposing.value = false
  })
})

onBeforeUnmount(() => {
  inputRef.value!.value = ''
  selectedObserver.value?.unobserve(selectedBoxRef.value)
})

function handleInputClick() {
  inputRef.value?.focus()
  inputRef.value?.click()
}
function clearInput() {
  inputRef.value!.value = ''
}

function handleChange(e: Event) {
  setTimeout(() => {
    if (!isComposing.value) {
      props.showDictItems((e.target as HTMLInputElement).value, props.filterItemIdx, e)
    }
  }, 0)
}
defineExpose({
  inputRef,
  clearInput,
})
</script>

<template>
  <div
    ref="MInputRef"
    class="value-input w-full iw-input iw-input-xs iw-input-bordered flex items-center gap-2 h-full rounded"
    :class="{ ' pointer-events-none iw-input-disabled': disabled }"
    :style="{ minWidth: `${width}px` }"
  >
    <!-- 已添加的多值列表 -->
    <!-- List of multiple values already added -->
    <div ref="selectedBoxRef" class="selected-box flex">
      <Badge
        v-for="(dictItemOrRawValue, valueIdx) in showBreviary ? options.slice(0, showCount) : options"
        :key="`${filterItem?.columnName}-${valueIdx}`" class="selected-item iw-badge max-w-24 flex"
        :option="dictItemOrRawValue" @click="handleInputClick"
        @delete="deleteAValue(filterItemIdx, valueIdx)"
      />
      <div v-if="showBreviary && breviaryCount > 0" class="iw-dropdown iw-dropdown-hover">
        <span tabindex="0" class="iw-badge selected-item">
          +{{ breviaryCount }}
        </span>
        <div
          tabindex="0"
          class="min-h-20 flex flex-wrap iw-dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
        >
          <Badge
            v-for="(dictItemOrRawValue, valueIdx) in options.slice(showCount)"
            :key="`${filterItem?.columnName}-${valueIdx}`" class="iw-badge max-w-24 flex"
            :option="dictItemOrRawValue"
            @delete="deleteAValue(filterItemIdx, showCount + valueIdx)"
          />
        </div>
      </div>
    </div>
    <!-- 字典的多值添加 -->
    <!-- Multiple value addition of dictionary -->

    <input
      ref="inputRef" class="pl-1 rounded-md iw-input-bordered w-4 border-none flex-1"
      :type="getInputTypeByDataKind(DataKind.TEXT)" :data-value-input-idx="filterItemIdx"
      @click="e => { showDictItems((e.target as HTMLInputElement).value, filterItemIdx, e) }"
      @input="handleChange"
    >
  </div>
</template>

<style scoped>
.selected-box .iw-dropdown .iw-dropdown-content {
    position: fixed;
}
</style>
