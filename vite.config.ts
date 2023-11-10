import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import vue from '@vitejs/plugin-vue'
import * as path from "path";

export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [
                IconsResolver({
                    prefix: 'Icon'
                })
            ]
        }),
        Icons({
            autoInstall: true
        })
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'task-table',
            formats: ['es', 'umd'],
            fileName: (format) => `task-table.${format}.js`
        },
        rollupOptions: {
            external: ['vue', 'vue-i18n', 'vanilla-framework', 'sortablejs'],
            output: {
                exports: 'named',
                globals: {
                    vue: 'Vue'
                }
            }
        },
        emptyOutDir: false
    },
    test: {
        globals: true,
        environment: "happy-dom"
    },
})
