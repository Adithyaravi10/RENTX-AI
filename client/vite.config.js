import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = dirname(fileURLToPath(import.meta.url));
const heroDest = join(root, 'public/hero/gt3-drift.png');
const heroSrc = join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Adithyaravi-Desktop-RentX-AI/assets/c__Users_Adithyaravi_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_this_is_something_for_some_car_lovers_hope_u_enjoy___-9956a501-1dc6-4cef-b387-cdbd9dd74f6f.png'
);
if (!existsSync(heroDest) && existsSync(heroSrc)) {
  mkdirSync(dirname(heroDest), { recursive: true });
  copyFileSync(heroSrc, heroDest);
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  preview: {
    port: 3000,
    strictPort: false,
    host: true,
  },
});
