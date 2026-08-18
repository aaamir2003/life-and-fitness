import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // این خط مسیر فایل‌های استاتیک را برای گیت‌هاب‌پیج اصلاح می‌کند
  base: './',
  build: {
    // اطمینان از اینکه فایل‌ها در پوشه dist به درستی تولید می‌شوند
    outDir: 'dist',
  },
  server: {
    // تنظیمات برای اجرای صحیح در محیط توسعه
    port: 3000,
  }
})