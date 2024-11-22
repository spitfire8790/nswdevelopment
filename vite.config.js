import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/eplanning': {
        target: 'https://api.apps1.nsw.gov.au/eplanning',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/eplanning/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.removeHeader('PageSize');
            proxyReq.removeHeader('PageNumber');
            proxyReq.removeHeader('filters');

            if (req.headers.pagesize) {
              proxyReq.setHeader('PageSize', req.headers.pagesize);
            }
            if (req.headers.pagenumber) {
              proxyReq.setHeader('PageNumber', req.headers.pagenumber);
            }
            if (req.headers.filters) {
              proxyReq.setHeader('filters', req.headers.filters);
            }

            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'PageSize, PageNumber, filters, Content-Type, Accept';
          });
        }
      }
    }
  }
})
