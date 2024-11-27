import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '~api': path.resolve(__dirname, './api'),
      },
    },
    server: {
      port: 3000,
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

              console.log('Proxying request:', {
                method: req.method,
                url: req.url,
                headers: proxyReq.getHeaders(),
                targetUrl: `${proxy.options.target}${req.url.replace('/api/eplanning', '')}`
              });
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'PageSize, PageNumber, filters, Content-Type, Accept';

              console.log('Received response:', {
                method: req.method,
                url: req.url,
                status: proxyRes.statusCode,
                headers: proxyRes.headers
              });
            });
          }
        },
        '/api/admin': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      'process.env': env
    }
  }
})
