import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // const basePath = env.BASE_PATH;

  const base = env.BASE_PATH ? `/${env.BASE_PATH}` : '';

  const proxy = {
    '/modules/plugins': {
      target: 'http://kbase-ui-deploy:80/plugins',
      changeOrigin: true,
      rewrite: (path: string) => {
        return path.replace(/^\/modules\/plugins/, '');
      },
      configure: (proxy, options) => {
        proxy.on('error', (error, request, response) => {
          console.error('PROXY ERROR', error);
        });
        proxy.on('proxyReq', (proxyRequest, request, response) => {
          console.error('PROXY Request', request.method, request.url);
        });
        proxy.on('proxyRes', (proxyResponse, request, response) => {
          console.error('PROXY Response', proxyResponse.statusCode, request.url);
        });
      },
    },
    '/plugins': {
      target: 'http://kbase-ui-deploy:80',
      changeOrigin: true,
    },
  };

  // This is for plugins; kbase-ui uses just /plugins
  proxy[`^${base}/modules/plugins/.*`] = {
    target: 'http://kbase-ui-deploy:80/plugins',
    changeOrigin: true,
    rewrite: (path: string) => {
      if (base) {
        return path.replace(new RegExp(`^${base}/modules/plugins/`), '');
        // return path.replace(new RegExp(`^${basePath}`), '');
      } else {
        return path.replace(new RegExp(`/modules/plugins/`), '');
      }
    },
  };

  // This is a stopgap - some (most?) plugins use the hard-coded path
  // /modules/plugins.
  // proxy[`/modules/plugins/.*`] = {
  //     target: 'http://kbase-ui-deploy:80/plugins',
  //     changeOrigin: true,
  //     // rewrite: (path: string) => {
  //     //     return path.replace(/^\/modules\/plugins/, '');
  //     // },

  //     rewrite: (path: string) => {
  //         return path.replace(new RegExp(`/modules/plugins/`), '');
  //     },
  //     configure: (proxy, options) => {
  //         proxy.on('error', (error, request, response) => {
  //             console.log('PROXY ERROR', error);
  //         });
  //         proxy.on('proxyReq', (proxyRequest, request, response) => {
  //             console.log('PROXY Request', request.method, request.url);
  //         });
  //         proxy.on('proxyRes', (proxyResponse, request, response) => {
  //             console.log('PROXY Response', proxyResponse.statusCode, request.url);
  //         });
  //     }
  // };

  // proxy[`^${basePath}/plugins/.*`] = {
  //     target: 'http://kbase-ui-deploy:80/plugins/',
  //     changeOrigin: true,
  //     // rewrite: (path: string) => {
  //     //     return path.replace(/^\/deploy\/plugins/, '');
  //     // }
  //     rewrite: (path: string) => {
  //         return path.replace(new RegExp(`^${basePath}`), '');
  //     },
  // };

  proxy[`^${base}/plugins/.*`] = {
    target: 'http://kbase-ui-deploy:80',
    changeOrigin: true,
    rewrite: (path: string) => {
      if (base) {
        return path.replace(new RegExp(`^${base}`), '');
      } else {
        return path;
      }
    },
  };

  proxy[`^${base}/deploy/.*`] = {
    target: 'http://kbase-ui-deploy:80',
    changeOrigin: true,
    rewrite: (path: string) => {
      if (base) {
        return path.replace(new RegExp(`^${base}`), '');
      } else {
        return path;
      }
    },
  };

  proxy[`^${base}/build/.*`] = {
    target: 'http://kbase-ui-deploy:80',
    changeOrigin: true,
    rewrite: (path: string) => {
      if (base) {
        return path.replace(new RegExp(`^${base}`), '');
      } else {
        return path;
      }
    },
  };

  // What uses this?
  proxy[`^${base}/deploy/plugins/.`] = {
    target: 'http://kbase-ui-deploy:80',
    changeOrigin: true,
    rewrite: (path: string) => {
      // return path.replace(/^\/deploy\/plugins/, '');
      if (base) {
        return path.replace(new RegExp(`^${base}/deploy/plugins/`), '');
      } else {
        return path;
      }
    },
  };

  return {
    plugins: [react(), tsconfigPaths()],
    // base: '/foo',
    base,
    build: {
      commonjsOptions: {
        include: ['node_modules/**'],
      },
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 500_000,
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
      coverage: {
        provider: 'v8',
        all: true,
      },
    },
  };
});
