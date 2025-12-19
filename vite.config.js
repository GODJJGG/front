import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],


  //重写 @ 为路径别名，指向 src 目录
  resolve: {
    alias: [
      {
        find: '@', 
        replacement: "/src",
      },
    ]
  }
})
