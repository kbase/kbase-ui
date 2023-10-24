import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    base: './',
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
                }
            }
        }
    },
    optimizeDeps: {
        disabled: 'build'
    },
    server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
            '/services': {
                target: 'https://ci.kbase.us',
                changeOrigin: true,
                secure: false,
            },
            '/dynserv': {
                target: 'https://ci.kbase.us',
                changeOrigin: true,
                secure: false
            },
            '/modules/plugins': {
                target: 'http://kbase-ui-deploy:80/plugins',
                changeOrigin: true,
                rewrite: (path: string) => {
                    return path.replace(/^\/modules\/plugins/, '');
                },
                configure: (proxy, options) => {
                    proxy.on('error', (error, request, response) => {
                        console.log('PROXY ERROR', error);
                    });
                    proxy.on('proxyReq', (proxyRequest, request, response) => {
                        console.log('PROXY Request', request.method, request.url);
                    });
                    proxy.on('proxyRes', (proxyResponse, request, response) => {
                        console.log('PROXY Response', proxyResponse.statusCode, request.url);
                    });
                }
            },
            '/deploy/plugins': {
                target: 'http://kbase-ui-deploy:80/plugins/',
                changeOrigin: true,
                rewrite: (path: string) => {
                    return path.replace(/^\/deploy\/plugins/, '');
                }
            },
            '/plugins': {
                target: 'http://kbase-ui-deploy:80',
                changeOrigin: true,
            },
            '/deploy': {
                target: 'http://kbase-ui-deploy:80/',
                changeOrigin: true,
            },
            '/build': {
                target: 'http://kbase-ui-deploy:80',
                changeOrigin: true,
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.js',
        coverage: {
            provider: 'v8',
            all: true
        }
    },
})
