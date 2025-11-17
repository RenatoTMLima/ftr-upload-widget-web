import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { withZephyr } from 'vite-plugin-zephyr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), withZephyr()],
})
