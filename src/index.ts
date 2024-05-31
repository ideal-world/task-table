import type { App } from 'vue'
import { defineCustomElement } from 'vue'
import './assets/main.css'
import locales from './locales'
import IwTaskTable from './Skeleton.vue'
import * as IwProps from './props'

export default (app: App): void => {
  app.use(locales).component('IwTaskTable', IwTaskTable)
}

export const IwTaskTableComp = defineCustomElement(IwTaskTable)

declare module 'vue' {
  export interface GlobalComponents {
    'IwTaskTable': typeof IwTaskTableComp
  }
}

export {
  IwTaskTable,
  IwProps,
}
