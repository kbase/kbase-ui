import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {

    const env = loadEnv(mode, process.cwd(), '');

    // console.log('ENV', basePath);

    // const basePath = env.BASE_PATH;;
    // const basePath = '/foo';
    const basePath = "./";

    const basetPathForProxy = basePath === './' ? '' : basePath;

    const proxy = {
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
        '/plugins': {
            target: 'http://kbase-ui-deploy:80',
            changeOrigin: true,
        },
    };

    // This is for plugins; kbase-ui uses just /plugins
    proxy[`^${basePath}/modules/plugins/.*`] = {
        target: 'http://kbase-ui-deploy:80/plugins',
        changeOrigin: true,
        rewrite: (path: string) => {
            return path.replace(new RegExp(`^${basePath}/modules/plugins/`), '');
        }
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

    proxy[`^${basetPathForProxy}/plugins/.*`] = {
        target: 'http://kbase-ui-deploy:80',
        changeOrigin: true,
        rewrite: (path: string) => {
            return path.replace(new RegExp(`^${basePath}`), '');
        },
    };

    proxy[`^${basetPathForProxy}/deploy/.*`] = {
        target: 'http://kbase-ui-deploy:80',
        changeOrigin: true,
        rewrite: (path: string) => {
            return path.replace(new RegExp(`^${basePath}`), '');
        },
    };


    proxy[`^${basetPathForProxy}/build/.*`] = {
        target: 'http://kbase-ui-deploy:80',
        changeOrigin: true,
        rewrite: (path: string) => {
            return path.replace(new RegExp(`^${basePath}`), '');
        },
    };

    // What uses this?
    proxy[`^${basetPathForProxy}/deploy/plugins/.`] = {
        target: 'http://kbase-ui-deploy:80',
        changeOrigin: true,
        rewrite: (path: string) => {
            return path.replace(/^\/deploy\/plugins/, '');
        }
    };

    console.log('PROXY', proxy);

    return {
        plugins: [react(), tsconfigPaths()],
        // base: '/foo',
        base: basePath,
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
            proxy
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
    }
});
