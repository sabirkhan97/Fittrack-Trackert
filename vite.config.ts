import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // Default Vite port, adjust if needed
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false, // Set to true if using HTTPS in production
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Useful for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});












// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
//   server: {
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'https://<codespace-name>-5000.app.github.dev', // Replace with your Codespaces URL
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: true,
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           vendor: ['react', 'react-dom', 'react-router-dom'],
//         },
//       },
//     },
//   },
// });













// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
//   server: {
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000', // Use this for local dev; for Codespaces, replace with 'https://<codespace-name>-5000.app.github.dev'
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: true,
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           vendor: ['react', 'react-dom', 'react-router-dom'],
//         },
//       },
//     },
//   },
// });