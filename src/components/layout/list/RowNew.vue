<script setup lang="ts">
import { inject } from 'vue';
import * as iconSvg from '../../../assets/icon';
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue';
import { FUN_NEW_DATA_TYPE } from '../../events';

const newDataFun = inject(FUN_NEW_DATA_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function newRow() {
  await newDataFun([{

  }])
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer text-sm" @click="newRow">
    <i :class="iconSvg.NEW" /> {{ $t('list.rowNew.newTitle') }}
  </div>
</template>
