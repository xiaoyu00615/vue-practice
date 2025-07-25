import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // 关键配置：设置资源基础路径为相对路径
  base: './',
  plugins: [
    vue(),
    // 处理兼容性（支持旧浏览器，本地打开也需要）
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    // 可选：Vue 开发者工具插件
    vueDevTools()
  ],
  resolve: {
    alias: {
      // 若有路径别名需求，保持默认配置即可
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})