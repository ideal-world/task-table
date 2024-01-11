import { defineCustomElement } from 'vue'
import type { App } from 'vue'
import './assets/main.css'
import { IwTaskTable } from './components'
import locales from './locales'

export default (app: App): void => {
  app.use(locales).component('IwTaskTable', IwTaskTable)
}

export const IwTaskTableComp = defineCustomElement(IwTaskTable)

declare module 'vue' {
  export interface GlobalComponents {
    'IwTaskTable': typeof IwTaskTableComp
  }
}

export * from './components/props'
