// /// <reference types="vitest" />
//
// import legacy from '@vitejs/plugin-legacy'
// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'
//
// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     legacy()
//   ],
//   test: {
//     globals: true,
//     environment: 'jsdom',
//     setupFiles: './src/setupTests.ts',
//   }
// })
/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        legacy()
    ],
    server: {
        proxy: {
            // FORWARD THE REQUEST TO THE BACKEND
            // BROWSER makes the req to localhost:8080 (frontend) -> FRONTEND - Vite proxy forwards internally the req to backend -> BACKEND - accessible inside the k8s cluster
            '/yolo': {
                target: 'http://backend-service:8000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,},
            '/user': {
                target: 'http://backend-service:8000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,},
            '/accounts': {
                target: 'http://backend-service:8000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,},
            '/analysis': {
                target: 'http://backend-service:8000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,},
            '/posts': {
                target: 'http://backend-service:8000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,},
            '/photo': {
                target: 'http://backend-service:8000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,},
            '/translate': {
                target: 'http://backend-service:8000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,},
            '/auth': {
                target: 'http://backend-service:8000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,},
            // WebSocket
            '/ws': {
                target: 'ws://backend-service:8000',
                ws: true,
                changeOrigin: true,
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
    }
})
