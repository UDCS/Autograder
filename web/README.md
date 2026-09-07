# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`

## Authentication & API requests

- **Token policy:** Access tokens are short-lived (`1h`), refresh tokens are longer-lived (`7d`), and server-side sessions enforce an absolute max window (`14d`).
- **Client behavior:** The frontend calls `/api/auth/refresh` on protected page load, retries once on `401`, and schedules proactive refreshes before access-token expiry.
- **Refresh rotation:** Each successful refresh rotates the refresh token and slides session expiry forward.
- **Fetch wrapper:** Use the `fetchWithAuth` helper in `web/src/utils/fetcher.ts` for authenticated API calls. It sets `credentials: 'include'` and handles refresh-on-`401`.
- **CORS / cookies:** When running backend and frontend on different origins, ensure the server allows credentials and the frontend origin (for example `Access-Control-Allow-Credentials: true` and `Access-Control-Allow-Origin: <frontend-origin>`).

Manual test steps:

1. Start backend and frontend, then log in.
2. In DevTools, verify `access_token`, `refresh_token`, and `session_id` cookies are present.
3. Keep a protected page open and active. Around access-token expiry, the client should refresh in the background without forcing a reload.
4. Trigger an authenticated API call after access-token expiry and confirm the request succeeds after a transparent refresh+retry.
5. Verify logout still clears all auth cookies and redirects to login.
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
