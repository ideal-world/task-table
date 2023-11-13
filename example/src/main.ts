import { createApp } from 'vue'
import App from './App.vue'
import IwTaskTable from 'task-table'
import 'task-table/dist/style.css'

createApp(App)
    .use(IwTaskTable)
    .mount('#app')
