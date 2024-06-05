<script setup lang="ts">
import * as iconSvg from '../../assets/icon';
import { IwUtils } from '../../utils';
import { getParentWithClass } from '../../utils/basic';
import { NODE_DEPTH_FLAG } from './RowTree';

const props = defineProps<{
  curData: { [key: string]: any }
  nextData?: { [key: string]: any }
  pkColumnName: string
  parentPkColumnName: string
  pkKindIsNumber: boolean
  expandDataPks: any[]
}>()

let IS_INIT = false

function expandNode(dataPk: any) {
  if (props.pkKindIsNumber) {
    dataPk = Number.parseInt(dataPk)
  }
  !props.expandDataPks.includes(dataPk) && props.expandDataPks.push(dataPk)
}

function shrinkNode(dataPk: any) {
  if (props.pkKindIsNumber) {
    dataPk = Number.parseInt(dataPk)
  }
  props.expandDataPks.includes(dataPk) && props.expandDataPks.splice(props.expandDataPks.indexOf(dataPk), 1)
}

function init() {
  IwUtils.delegateEvent('.iw-list', 'click', '.iw-tree-node--expand', (e) => {
    expandNode(getParentWithClass(e.target as HTMLElement, 'iw-list-data-row')!.dataset.pk!)
  })
  IwUtils.delegateEvent('.iw-list', 'click', '.iw-tree-node--shrink', (e) => {
    shrinkNode(getParentWithClass(e.target as HTMLElement, 'iw-list-data-row')!.dataset.pk!)
  })
}

if (!IS_INIT) {
  IS_INIT = true
  init()
}
</script>

<template>
  <div class="flex justify-end iw-list-data-cell__container" :style="{ width: `${15 * (props.curData[NODE_DEPTH_FLAG] + 1)}px` }">
    <template v-if="props.nextData && props.nextData[props.parentPkColumnName] === props.curData[props.pkColumnName]">
      <i v-if="props.expandDataPks.indexOf(curData[props.pkColumnName]) === -1" :class="iconSvg.EXPAND" class="iw-tree-node--expand cursor-pointer" />
      <i v-else :class="iconSvg.SHRINK" class="iw-tree-node--shrink cursor-pointer" />
    </template>
  </div>
</template>
