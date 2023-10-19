import {createApp} from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import IwTaskTable from '@idealworld/task-table';
import '@idealworld/task-table/dist/style.css';

createApp(App)
    .use(ElementPlus)
    .use(IwTaskTable)
    .mount('#app')
