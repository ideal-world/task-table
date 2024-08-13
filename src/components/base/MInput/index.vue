<script setup lang="ts">
import { DataKind, getInputTypeByDataKind } from '../../../props/enumProps'
import Badge from '../../common/Badge.vue';

import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
    //过滤项
    filterItem?: any
    //过滤项的索引
    filterItemIdx?: number
    // 已筛选项
    options: any[]
    showDictItems: Function
    deleteAValue: Function
    // label宽度
    width?: number
}>()

const emits = defineEmits(['deleteAValue'])

const labelWidth = computed(() => props.width || 240)
const selectedBoxWidth = computed(() => labelWidth.value * 0.8)
//观察器
const selectedObserver = ref()
const selectedBoxRef = ref()
//是否显示缩略badge
const showBreviary = ref(false)
//缩略时显示的个数
const breviaryShowCount = ref(0);
//缩略的个数
const breviaryCount = computed(() => props.options.length - breviaryShowCount.value)
// 字典值输入框引用
// Dictionary value input box reference
const inputRef = ref<InstanceType<typeof HTMLInputElement>>()

onMounted(() => {
    selectedObserver.value = new ResizeObserver(() => {
        //有缩略个数时不进入下面的判断
        if (breviaryShowCount.value && breviaryCount.value > 0) return

        if (selectedBoxRef.value.offsetWidth > selectedBoxWidth.value) {
            showBreviary.value = true
            breviaryShowCount.value = props.options.length - 1

        } else {
            showBreviary.value = false
            breviaryShowCount.value = 0
        }
    })
    selectedObserver.value?.observe(selectedBoxRef.value)
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
defineExpose({
    inputRef,
    clearInput,
})
</script>
<template>
    <div class="value-input iw-input iw-input-xs iw-input-bordered flex items-center gap-2 h-[30px] rounded-sm"
        :style="{ width: labelWidth + 'px' }">
        <!-- 已添加的多值列表 -->
        <!-- List of multiple values already added -->
        <div ref="selectedBoxRef" class="selected-box flex">
            <Badge
                v-for="(dictItemOrRawValue, valueIdx) in showBreviary ? options.slice(0, breviaryShowCount) : options"
                :key="`${filterItem?.columnName}-${valueIdx}`" class="iw-badge max-w-24 flex"
                :dictItemOrRawValue="dictItemOrRawValue" @click="handleInputClick"
                @delete="deleteAValue(filterItemIdx, valueIdx)" />
            <div v-if="showBreviary && breviaryCount > 0" class="iw-dropdown iw-dropdown-hover">
                <span tabindex="0" class="iw-badge">
                    +{{ breviaryCount }}
                </span>
                <div tabindex="0"
                    class="min-h-20 flex flex-wrap iw-dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                    <Badge v-for="(dictItemOrRawValue, valueIdx) in options.slice(breviaryShowCount)"
                        :key="`${filterItem?.columnName}-${valueIdx}`" class="iw-badge max-w-24 flex"
                        :dictItemOrRawValue="dictItemOrRawValue"
                        @delete="deleteAValue(filterItemIdx, breviaryShowCount + valueIdx)" />
                </div>
            </div>

        </div>
        <!-- 字典的多值添加 -->
        <!-- Multiple value addition of dictionary -->
        <input ref="inputRef" class="pl-1 rounded-md iw-input-bordered w-4 border-none flex-1"
            :type="getInputTypeByDataKind(DataKind.TEXT)" :data-value-input-idx="filterItemIdx"
            @click="e => { showDictItems((e.target as HTMLInputElement).value, filterItemIdx, e) }"
            @keyup="e => { showDictItems((e.target as HTMLInputElement).value, filterItemIdx, e) }">
    </div>
</template>