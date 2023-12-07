import { createApp } from 'vue'
import IwTaskTable from 'task-table'
import App from './App.vue'
import 'task-table/dist/style.css'

createApp(App)
  .use(IwTaskTable)
  .mount('#app')
