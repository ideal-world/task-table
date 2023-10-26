import { App, defineCustomElement } from 'vue'
import i18n from './i18n'
import { IwTaskTable } from './components'

export default (app: App): void => {
  app.use(i18n).component('IwTaskTable', IwTaskTable)
}

// @ts-ignore
export const IwTaskTableComp = defineCustomElement(IwTaskTable)

declare module 'vue' {
  export interface GlobalComponents {
    'IwTaskTable': typeof IwTaskTableComp,
  }
}

export * from './components/props'
