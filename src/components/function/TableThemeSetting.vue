<script setup lang="ts">
import type { TableStyleModifyProps } from '../../props'
import * as eb from '../eventbus'

async function changeTheme(e: Event) {
  const targetEle = e.target as HTMLInputElement
  const theme = targetEle.value
  if (theme !== undefined) {
    const tableStyleConf: TableStyleModifyProps = {
      theme,
    }
    await eb.modifyStyles(tableStyleConf)
  }
}
</script>

<template>
  <div class="iw-contextmenu__item w-full px-1  bg-base-200  rounded-md">
    <div class="flex justify-between items-center" @click="changeTheme">
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="default"
        style="border-width: 1px; border-style: solid; border-color: rgb(87, 13, 248);"
      >
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="cupcake"
        style="border-width: 1px; border-style: solid; border-color: rgb(101, 195, 200);"
      >
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="lofi"
        style="border-width: 1px; border-style: solid; border-color: rgb(13, 13, 13);"
      >
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="acid"
        style="border-width: 1px; border-style: solid; border-color: rgb(255, 0, 242);"
      >
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="lemonade"
        style="border-width: 1px; border-style: solid; border-color: rgb(82, 155, 3);"
      >
    </div>
    <div class="flex justify-between items-center pt-1">
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="dark"
        style="background-color: black;"
      >
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="night"
        style="background-color: rgb(58, 191, 248);"
      >
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="forest"
        style="background-color: rgb(30, 184, 84);"
      >
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="coffee"
        style="background-color: rgb(220, 148, 76);"
      >
      <input
        type="radio" name="theme-buttons" class="iw-btn iw-btn-xs iw-btn-circle theme-controller" value="black"
        style="background-color: rgb(52, 50, 50);"
      >
    </div>
  </div>
</template>
