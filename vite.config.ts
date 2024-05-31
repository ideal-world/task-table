import * as path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ['src'],
      extensions: ['vue'],
      dts: 'components.d.ts',
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'task-table',
      formats: ['es', 'umd'],
      fileName: format => `task-table.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'vue-i18n', 'octicons-css', 'sortablejs', 'dayjs'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
    emptyOutDir: false,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
})
