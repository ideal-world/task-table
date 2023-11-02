import { App, defineCustomElement } from 'vue'
import locales from './locales'
import { IwTaskTable } from './components'

export default (app: App): void => {
  app.use(locales).component('IwTaskTable', IwTaskTable)
}

// @ts-ignore
export const IwTaskTableComp = defineCustomElement(IwTaskTable)

declare module 'vue' {
  export interface GlobalComponents {
    'IwTaskTable': typeof IwTaskTableComp,
  }
}

export * from './components/props'
