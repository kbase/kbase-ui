import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

import { defineConfig } from 'vitest/config';


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    base: './',
    build: {
        commonjsOptions: { include: [] },
    },
    optimizeDeps: {
        disabled: false,
    },
    // resolve: {
    //     alias: {
    //         '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    //     }
    // },
    server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
            '/services': {
                target: 'https://ci.kbase.us',
                changeOrigin: true,
                secure: false,

                // configure: (proxy, options) => {
                //     proxy.on('error', (error, request, response) => {
                //         console.log('PROXY ERROR', error);
                //     });
                //     proxy.on('proxyReq', (proxyRequest, request, response) => {
                //         console.log('PROXY Request', request.method, request.url);
                //     });
                //     proxy.on('proxyRes', (proxyResponse, request, response) => {
                //         console.log('PROXY Response', proxyResponse.statusCode, request.url);
                //     });
                // }
            },
            '/dynserv': {
                target: 'https://ci.kbase.us',
                changeOrigin: true,
                secure: false
            },
            // '/index.html/deploy/plugins/': {
            //     target: 'http://kbase-ui-deploy:80/plugins/',
            //     changeOrigin: true,
            //     pathRewrite: { [`^/index.html/deploy/plugins/`]: '' }
            // },
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
                // rewrite: (path: string) => {
                //     return path.replace(/^\/plugins/, '');
                // }
            },
            '/deploy': {
                target: 'http://kbase-ui-deploy:80/',
                changeOrigin: true,
                // rewrite: (path: string) => {
                //     console.log('deploy rewrite?', path);
                //     return path.replace('^/deploy', '');
                // },
                // configure: (proxy, options) => {
                //     proxy.on('error', (error, request, response) => {
                //         console.log('PROXY ERROR', error);
                //     });
                //     proxy.on('proxyReq', (proxyRequest, request, response) => {
                //         console.log('PROXY Request', request.method, request.url);
                //     });
                //     proxy.on('proxyRes', (proxyResponse, request, response) => {
                //         console.log('PROXY Response', proxyResponse.statusCode, request.url);
                //     });
                // }
            },
            '/build': {
                target: 'http://kbase-ui-deploy:80',
                changeOrigin: true,
                // rewrite: (path: string) => {
                //     return path.replace(/^\/build/, '');
                // }
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
