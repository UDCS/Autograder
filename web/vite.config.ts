import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const root = resolve(__dirname, 'src')
const outDir = resolve(__dirname, 'dist')

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    preserveSymlinks: false
  },
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
        FAQ: resolve(root, 'FAQ', 'FAQ.html'),
        resetPW: resolve(root, 'resetpassword', 'resetpassword.html'),
        dashboard: resolve(root, "dashboard", "dashboard.html"),
        signup: resolve(root, 'signup', 'signup.html'),
        account: resolve(root, 'account', 'account.html'),
        classroom: resolve(root, 'classroom', 'classroom.html'),
        assignment: resolve(root, 'assignment', 'assignment.html')
      }
    }
  }
})
