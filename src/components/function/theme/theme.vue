<script setup lang="ts">
import { onMounted } from 'vue';
import { themeChange } from 'theme-change'

onMounted(() => {
  themeChange(false)
})

</script>

<template>
  <div class="iw-contextmenu__item w-full pl-1 pr-1  bg-base-200  rounded-md">
    <div class="flex justify-between items-center">
      <button class="badge badge-md" data-set-theme=""
        style="border-width: 1px; border-style: solid; border-color: rgb(87, 13, 248);"></button>
      <button class="badge badge-md" data-set-theme="cupcake"
        style="border-width: 1px; border-style: solid;border-color: rgb(101, 195, 200);"></button>
      <button class="badge badge-md" data-set-theme="lofi"
        style="border-width: 1px; border-style: solid;border-color: rgb(13, 13, 13);"></button>
      <button class="badge badge-md" data-set-theme="acid"
        style="border-width: 1px; border-style: solid;border-color: rgb(255, 0, 242);"></button>
      <button class="badge badge-md" data-set-theme="lemonade"
        style="border-width: 1px; border-style: solid;border-color: rgb(82, 155, 3);"></button>
    </div>
    <div class="flex justify-between items-center pt-1">
      <button class="badge badge-md" data-set-theme="dark" style="background-color: black;"></button>
      <button class="badge badge-md" data-set-theme="night" style="background-color: rgb(58, 191, 248);"></button>
      <button class="badge badge-md" data-set-theme="forest" style="background-color: rgb(30, 184, 84);"></button>
      <button class="badge badge-md" data-set-theme="coffee" style="background-color: rgb(220, 148, 76);"></button>
      <button class="badge badge-md" data-set-theme="black" style="background-color: rgb(52, 50, 50);"></button>
    </div>
  </div>
</template>
