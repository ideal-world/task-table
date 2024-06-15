import type { App } from 'vue'
import { defineCustomElement } from 'vue'
import './assets/main.css'
import * as IwEvents from './events'
import locales from './locales'
import * as IwProps from './props/index'
import IwTaskTable from './Skeleton.vue'

export default (app: App): void => {
  app.use(locales).component('IwTaskTable', IwTaskTable)
}

export const IwTaskTableComp = defineCustomElement(IwTaskTable)

declare module 'vue' {
  export interface GlobalComponents {
    IwTaskTable: typeof IwTaskTableComp
  }
}

export {
  IwEvents,
  IwProps,
  IwTaskTable
}

