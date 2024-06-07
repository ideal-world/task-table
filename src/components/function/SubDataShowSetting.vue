<script setup lang="ts">
import * as iconSvg from '../../assets/icon'
import type { TableLayoutModifyProps } from '../../props'
import { SubDataShowKind } from '../../props'
import * as eb from '../eventbus'

const props = defineProps<{
  subDataShowKind: SubDataShowKind
}>()

async function setSubDataShow(subDataShowKind: SubDataShowKind) {
  const changedLayoutReq: TableLayoutModifyProps = {
    subDataShowKind,
  }
  await eb.modifyLayout(changedLayoutReq)
}
</script>

<template>
  <div class="iw-divider cursor-pointer iw-table-setting-title">
    {{ $t('function.subData.title') }}
  </div>
  <div style="display: none;">
    <div class="flex justify-between">
      <button
        class="iw-btn m-1 flex-1"
        :title="$t('function.subData.tileAllData')"
        :class="props.subDataShowKind === SubDataShowKind.TILE_ALL_DATA ? 'iw-btn-neutral' : 'iw-btn-outline '"
        @click="setSubDataShow(SubDataShowKind.TILE_ALL_DATA)"
      >
        <div class="flex items-center flex-col pb-1">
          <i :class="`${iconSvg.TILE_ALL_DATA}`" class="text-lg" />
          <span class="text-xs font-normal">{{ $t('function.subData.tileAllDataTitle') }}</span>
        </div>
      </button>
      <button
        class="iw-btn m-1 flex-1"
        :title="$t('function.subData.foldSubData')"
        :class="props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? 'iw-btn-neutral' : 'iw-btn-outline'"
        @click="setSubDataShow(SubDataShowKind.FOLD_SUB_DATA)"
      >
        <div class="flex items-center flex-col pb-1">
          <i :class="`${iconSvg.FOLD_SUB_DATA}`" class="text-lg" />
          <span class="text-xs font-normal">{{ $t('function.subData.foldSubDataTitle') }}</span>
        </div>
      </button>
      <button
        class="iw-btn m-1 flex-1"
        :title="$t('function.subData.onlyParentData')"
        :class="props.subDataShowKind === SubDataShowKind.ONLY_PARENT_DATA ? 'iw-btn-neutral' : 'iw-btn-outline'"
        @click="setSubDataShow(SubDataShowKind.ONLY_PARENT_DATA)"
      >
        <div class="flex items-center flex-col pb-1">
          <i :class="`${iconSvg.ONLY_PARENT_DATA}`" class="text-lg" />
          <span class="text-xs font-normal">{{ $t('function.subData.onlyParentDataTitle') }}</span>
        </div>
      </button>
    </div>
  </div>
</template>
