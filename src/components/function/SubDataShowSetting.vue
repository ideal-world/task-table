<script setup lang="ts">
import { ref } from 'vue'
import TableSetCommon from '../common/TableSetCommon.vue'
import * as iconSvg from '../../assets/icon'
import type { LayoutModifyProps } from '../../props'
import { SubDataShowKind } from '../../props'
import * as eb from '../eventbus'

const props = defineProps<{
  // 子数据展示方式
  // Sub-data display method
  subDataShowKind: SubDataShowKind
}>()

const showList = ref([
  {
    icon: iconSvg.TILE_ALL_DATA,
    title: 'function.subData.tileAllDataTitle',
    value: SubDataShowKind.TILE_ALL_DATA,
  },
  {
    icon: iconSvg.FOLD_SUB_DATA,
    title: 'function.subData.foldSubDataTitle',
    value: SubDataShowKind.FOLD_SUB_DATA,
  },
  {
    icon: iconSvg.ICON_EYE_CLOSED,
    title: 'function.subData.onlyParentDataTitle',
    value: SubDataShowKind.ONLY_PARENT_DATA,
  },
])

async function setSubDataShow(subDataShowKind: SubDataShowKind) {
  const changedLayoutReq: LayoutModifyProps = {
    subDataShowKind,
  }
  await eb.modifyLayout(changedLayoutReq)
}
</script>

<template>
  <TableSetCommon :title="$t('function.subData.title')" isShow>
    <div class="flex justify-between border-8 rounded-2xl border-gray-200">
      <div
        v-for="item in showList"
        :key="item.value"
        class="flex-1 px-2 flex justify-center items-center cursor-pointer hover:bg-primary hover:text-white" :class="[
          SubDataShowKind.TILE_ALL_DATA === item.value && 'rounded-l-2xl',
          SubDataShowKind.ONLY_PARENT_DATA === item.value && 'rounded-r-2xl',
          props.subDataShowKind === item.value ? 'bg-primary text-white' : 'iw-btn-outline',

        ]"
        @click="setSubDataShow(item.value)"
      >
        <i :class="`${item.icon}`" class="text-lg mr-1" />
        <span class="text-xs font-normal">{{
          $t(item.title)
        }}</span>
      </div>
    </div>
  </TableSetCommon>
</template>
