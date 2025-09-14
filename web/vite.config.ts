import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        test: resolve(root, "test", "test.html"),
        login: resolve(root, "login", "login.html"),
        about: resolve(root, "about", "about.html"),
        FAQ: resolve(root, "FAQ", "FAQ.html"),
        resetPW: resolve(root, "resetpassword", "resetpassword.html"),
        dashboard: resolve(root, "dashboard", "dashboard.html"),
        signup: resolve(root, "signup", "signup.html"),
        account: resolve(root, "account", "account.html"),
        classroom: resolve(root, "classroom", "classroom.html"),
        classroomManager: resolve(
          root,
          "manageclassroom",
          "manageclassroom.html"
        ),
        assignment: resolve(root, "assignment", "assignment.html"),
      },
    },
  },
});
