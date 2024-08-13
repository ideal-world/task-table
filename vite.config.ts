import * as path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
// import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ['src'],
      extensions: ['vue'],
      dts: 'components.d.ts',
    }),
    // Use to analyze package size
    // visualizer({ open: true }),
  ],
  server: {
    // Listening on all local IPs
    host: true,
    open: true,
    port: 3001,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'task-table',
      formats: ['es', 'umd'],
      fileName: format => `task-table.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'vue-i18n', 'sortablejs', 'dayjs'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
    emptyOutDir: false,
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
})
