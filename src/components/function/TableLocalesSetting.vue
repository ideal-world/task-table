<script setup lang="ts">
import { changeLocale } from '../../locales';

function changeLocales(locale: 'zh' | 'en') {
  changeLocale(locale)
}
</script>

<template>
  <div class="iw-contextmenu__item flex justify-between items-center px-8">
    <div class="cursor-pointer" @click="changeLocales('zh')">
      中文
    </div>
    <div class="cursor-pointer" @click="changeLocales('en')">
      English
    </div>
  </div>
</template>
