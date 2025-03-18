import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
<<<<<<< Updated upstream
  plugins: [react()],
=======
  root,
  plugins: [react(), tailwindcss()],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        test: resolve(root, 'test', 'test.html'),
        login: resolve(root, 'login', 'login.html'),
        about: resolve(root, 'about', 'about.html'),
        FAQ: resolve(root, 'FAQ', 'FAQ.html')
      }
    }
  }
>>>>>>> Stashed changes
})
