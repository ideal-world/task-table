import { createI18n } from 'vue-i18n'
import en from './assets/locales/en.json'
import zh from './assets/locales/zh-CN.json'

const locales = createI18n({
  legacy: false,
  locale: (typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : undefined) || (typeof navigator !== 'undefined' && typeof navigator.language !== 'undefined' ? navigator.language.slice(0, 2) : undefined),
  fallbackLocale: 'en',
  messages: {
    zh,
    en,
  },
})

export function changeLocale(locale: 'en' | 'zh') {
  locales.global.locale.value = locale
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('locale', locale)
  }
}

export default locales
