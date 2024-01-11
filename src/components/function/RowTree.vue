<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../assets/icon'
import { getParentWithClass } from '../../utils/basic'
import { FUN_MODIFY_LAYOUT_TYPE } from '../events'
import { NODE_DEPTH_FLAG } from './RowTree'

const props = defineProps<{
  curData: { [key: string]: any }
  nextData?: { [key: string]: any }
  pkColumnName: string
  parentPkColumnName: string
  pkKindIsNumber: boolean
  expandDataPks: any[]
}>()

let IS_INIT = false

const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!

async function expandNode(dataPk: any) {
  if (props.pkKindIsNumber)
    dataPk = Number.parseInt(dataPk)

  await modifyLayoutFun({
    newExpandDataPk: dataPk,
  })
}

async function shrinkNode(dataPk: any) {
  if (props.pkKindIsNumber)
    dataPk = Number.parseInt(dataPk)

  await modifyLayoutFun({
    deleteExpandDataPk: dataPk,
  })
}

function init() {
  document.querySelectorAll('.iw-tt').forEach(async (ttEle) => {
    ttEle.addEventListener('click', async (event) => {
      const targetEle = event.target as HTMLElement
      if (targetEle.classList.contains('iw-tree-node--expand'))
        await expandNode(getParentWithClass(targetEle, 'iw-list-data-row')!.dataset.pk!)

      else if (targetEle.classList.contains('iw-tree-node--shrink'))
        await shrinkNode(getParentWithClass(targetEle, 'iw-list-data-row')!.dataset.pk!)
    })
  })
}

if (!IS_INIT) {
  IS_INIT = true
  init()
}
</script>

<template>
  <div class="flex justify-end iw-list-data-cell__container" :style="{ width: `${20 * (props.curData[NODE_DEPTH_FLAG] + 1)}px` }">
    <template v-if="props.nextData && props.nextData[props.parentPkColumnName] === props.curData[props.pkColumnName]">
      <i v-if="props.expandDataPks.indexOf(curData[props.pkColumnName]) === -1" :class="iconSvg.EXPAND" class="iw-tree-node--expand cursor-pointer" />
      <i v-else :class="iconSvg.SHRINK" class="iw-tree-node--shrink cursor-pointer" />
    </template>
  </div>
</template>
