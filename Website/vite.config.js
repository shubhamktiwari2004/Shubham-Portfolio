import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'


export default defineConfig({
  base: process.env.VERCEL === '1'
    ? '/'
    : '/Shubham-Portfolio/',
  plugins: [react()],
})
