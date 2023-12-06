<script setup lang="ts">
import { inject } from 'vue';
import type { CachedColumnConf } from '../../conf';
import { FUN_MODIFY_COLUMN_TYPE } from '../../events';
import { DataKind } from '../../props';

const props = defineProps<{
  curColumnConf: CachedColumnConf | undefined
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!

async function setDateTimeFormat(newFormat: string) {
  if (props.curColumnConf) {
    await modifyColumnFun({
      name: props.curColumnConf.name,
      title: props.curColumnConf.title,
      icon: props.curColumnConf.icon,
      dataKind: props.curColumnConf.dataKind,
      dataEditable: props.curColumnConf.dataEditable,
      useDict: props.curColumnConf.useDict,
      dictEditable: props.curColumnConf.dictEditable,
      multiValue: props.curColumnConf.multiValue,
      kindDateTimeFormat: newFormat,
    })
  }
}
</script>

<template>
  <div v-show="props.curColumnConf?.dataKind === DataKind.DATETIME || props.curColumnConf?.dataKind === DataKind.DATE || props.curColumnConf?.dataKind === DataKind.TIME" class="iw-contextmenu__item w-full">
    <div class="divider">
      {{ $t('list.columnKindDateTime.dateTitle') }}
    </div>
    <input
      :value="props.curColumnConf?.kindDateTimeFormat"
      class="input input-bordered input-xs w-full" type="text" :placeholder="$t('list.columnKindDateTime.formatPlaceholder')"
      @change="event => setDateTimeFormat((event.target as HTMLInputElement).value)"
    >
    <div class="text-sm m-1 p-1 bg-base-200 rounded-md">
      <template v-if="props.curColumnConf?.dataKind === DataKind.DATETIME">
        {{ $t('list.columnKindDateTime.dateFormatTip') }}<br>
        {{ $t('list.columnKindDateTime.timeFormatTip') }}
      </template>
      <template v-if="props.curColumnConf?.dataKind === DataKind.DATE">
        {{ $t('list.columnKindDateTime.dateFormatTip') }}
      </template>
      <template v-if="props.curColumnConf?.dataKind === DataKind.TIME">
        {{ $t('list.columnKindDateTime.timeFormatTip') }}
      </template>
    </div>
  </div>
</template>
