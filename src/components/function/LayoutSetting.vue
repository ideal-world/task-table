<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import { SubDataShowKind, type TableLayoutModifyProps } from '../../props'
import MenuComp from '../common/Menu.vue'
import type { TableBasicConf, TableLayoutColumnConf, TableLayoutConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  basicConf: TableBasicConf
  layoutConf: TableLayoutConf
}>()
const columnCompRef = ref<InstanceType<typeof MenuComp>>()

async function setShowToggleColumn(columnConf: TableLayoutColumnConf) {
  const changedLayoutReq: TableLayoutModifyProps = {
    changedColumn: {
      name: columnConf.name,
      wrap: columnConf.wrap,
      fixed: columnConf.fixed,
      width: columnConf.width,
      hide: !columnConf.hide,
      dateStart: columnConf.dateStart,
      dateEnd: columnConf.dateEnd,
      render: columnConf.render,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
}

async function setSubDataShow(subDataShowKind: SubDataShowKind) {
  const changedLayoutReq: TableLayoutModifyProps = {
    subDataShowKind,
  }
  await eb.modifyLayout(changedLayoutReq)
}
</script>

<template>
  <a class="cursor-pointer"><i :class="iconSvg.MORE" @click="(e) => { columnCompRef?.show(e) }" /></a>
  <MenuComp ref="columnCompRef">
    <template v-if="props.basicConf.parentPkColumnName">
      <div class="iw-divider">
        {{ $t('layout.subData.title') }}
      </div>
      <div class="flex justify-between">
        <button
          class="iw-btn m-1 flex-1"
          :title="$t('layout.subData.tileAllData')"
          :class="props.layoutConf.subDataShowKind === SubDataShowKind.TILE_ALL_DATA ? 'iw-btn-neutral' : 'iw-btn-outline '"
          @click="setSubDataShow(SubDataShowKind.TILE_ALL_DATA)"
        >
          <div class="flex items-center flex-col pb-1">
            <i :class="`${iconSvg.TILE_ALL_DATA}`" class="text-lg" />
            <span class="text-xs font-normal">{{ $t('layout.subData.tileAllDataTitle') }}</span>
          </div>
        </button>
        <button
          class="iw-btn m-1 flex-1"
          :title="$t('layout.subData.foldSubData')"
          :class="props.layoutConf.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? 'iw-btn-neutral' : 'iw-btn-outline'"
          @click="setSubDataShow(SubDataShowKind.FOLD_SUB_DATA)"
        >
          <div class="flex items-center flex-col pb-1">
            <i :class="`${iconSvg.FOLD_SUB_DATA}`" class="text-lg" />
            <span class="text-xs font-normal">{{ $t('layout.subData.foldSubDataTitle') }}</span>
          </div>
        </button>
        <button
          class="iw-btn m-1 flex-1"
          :title="$t('layout.subData.onlyParentData')"
          :class="props.layoutConf.subDataShowKind === SubDataShowKind.ONLY_PARENT_DATA ? 'iw-btn-neutral' : 'iw-btn-outline'"
          @click="setSubDataShow(SubDataShowKind.ONLY_PARENT_DATA)"
        >
          <div class="flex items-center flex-col pb-1">
            <i :class="`${iconSvg.ONLY_PARENT_DATA}`" class="text-lg" />
            <span class="text-xs font-normal">{{ $t('layout.subData.onlyParentDataTitle') }}</span>
          </div>
        </button>
      </div>
    </template>
    <div class="iw-divider">
      {{ $t('function.column.showTitle') }}
    </div>
    <div v-for="column in props.layoutConf.columns.filter(column => column.name !== props.basicConf.pkColumnName)" :key="column.name" class="iw-contextmenu__item flex justify-between w-full">
      <span>
        <i :class="props.basicConf.columns.find(col => col.name === column.name)?.icon" />
        {{ props.basicConf.columns.find(col => col.name === column.name)?.title }}
      </span>
      <input
        type="checkbox" class="iw-toggle iw-toggle-xs"
        :checked="!props.layoutConf.columns.find(col => col.name === column.name)?.hide ?? false"
        @click="setShowToggleColumn(column)"
      >
    </div>
  </MenuComp>
</template>
