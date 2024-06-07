<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import { SubDataShowKind, type TableLayoutModifyProps } from '../../props'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/Menu.vue'
import type { TableLayoutConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  layoutConf: TableLayoutConf
  layoutLength: number
}>()
const confirmDeleteLayoutCompRef = ref<InstanceType<typeof MenuComp>>()
const confirmResetLayoutCompRef = ref<InstanceType<typeof MenuComp>>()

async function deleteLayout() {
  await eb.deleteLayout(props.layoutConf.id)
  confirmDeleteLayoutCompRef.value?.close()
}

async function resetLayout() {
  const layout: TableLayoutModifyProps = {
    filters: [],
    sorts: [],
    removeGroup: true,
    aggs: {},
    groupSlices: {},
    subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
    defaultSlice: {
      offsetNumber: 0,
      fetchNumber: props.layoutConf.defaultSlice.fetchNumber,
      fetchNumbers: props.layoutConf.defaultSlice.fetchNumbers,
    },
  }
  await eb.modifyLayout(layout)
  confirmResetLayoutCompRef.value?.close()
}
</script>

<template>
  <div class="iw-divider cursor-pointer iw-table-setting-title">
    {{ $t('layout.settingTitle') }}
  </div>
  <div style="display: none;">
    <div class="flex justify-between">
      <button
        class="iw-btn iw-btn-xs"
        :title="$t('layout.reset.title')"
        @click="e => { confirmResetLayoutCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, MenuSizeKind.MINI, true) }"
      >
        <i :class="`${iconSvg.RESET}`" />
        <span>{{ $t('layout.reset.title') }}</span>
      </button>
      <MenuComp ref="confirmResetLayoutCompRef">
        <div class="iw-contextmenu__item flex items-center justify-between w-full text-error">
          {{ $t('layout.reset.confirm', { title: props.layoutConf.title }) }}
        </div>
        <div class="iw-contextmenu__item flex items-center justify-between w-full pl-2 pr-2">
          <button
            class="iw-btn iw-btn-secondary iw-btn-xs"
            @click="resetLayout"
          >
            <i :class="`${iconSvg.CONFIRM}`" />
          </button>
          <button
            class="iw-btn iw-btn-xs"
            @click="e => { confirmResetLayoutCompRef?.close() }"
          >
            <i :class="`${iconSvg.CANCEL}`" />
          </button>
        </div>
      </MenuComp>
      <button
        v-if="props.layoutLength > 1"
        class="iw-btn iw-btn-xs"
        :title="$t('layout.delete.title')"
        @click="e => { confirmDeleteLayoutCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, MenuSizeKind.MINI, true) }"
      >
        <i :class="`${iconSvg.TRASH}`" />
        <span>{{ $t('layout.delete.title') }}</span>
      </button>
      <MenuComp ref="confirmDeleteLayoutCompRef">
        <div class="iw-contextmenu__item flex items-center justify-between w-full text-error">
          {{ $t('layout.delete.confirm', { title: props.layoutConf.title }) }}
        </div>
        <div class="iw-contextmenu__item flex items-center justify-between w-full pl-2 pr-2">
          <button
            class="iw-btn iw-btn-secondary iw-btn-xs"
            @click="deleteLayout"
          >
            <i :class="`${iconSvg.CONFIRM}`" />
          </button>
          <button
            class="iw-btn iw-btn-xs"
            @click="e => { confirmDeleteLayoutCompRef?.close() }"
          >
            <i :class="`${iconSvg.CANCEL}`" />
          </button>
        </div>
      </MenuComp>
    </div>
  </div>
</template>
