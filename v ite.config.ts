@@ .. @@
 import { defineConfig } from 'vite'
 import react from '@vitejs/plugin-react'
 import path from 'path'
+import { imagetools } from 'vite-imagetools'

 // https://vitejs.dev/config/
 export default defineConfig({
   plugins: [
     react(),
+        imagetools()
   ],
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   },