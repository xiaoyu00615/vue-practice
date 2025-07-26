import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './', // 相对路径
  plugins: [
    vue(),
    viteSingleFile() // 内联所有资源到单个HTML
  ],
  build: {
    rollupOptions: {
      output: {
        format: 'iife', // 生成自执行函数（无模块化）
        inlineDynamicImports: true // 合并所有代码，避免动态加载
      }
    },
    modulePreload: {
      polyfill: false // 禁用模块预加载
    }
  }
})