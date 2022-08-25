const { createProxyMiddleware, re } = require('http-proxy-middleware');

// Strangely, /index.html is the root path that CRA dev container sets.

const basePath = process.env.PUBLIC_URL

const pluginsRoot = `/index.html${basePath}/deploy/plugins/`;

console.log('base path', basePath, pluginsRoot);

module.exports = function (app) {
    //   app.use(
    //     '/plugins',
    //     createProxyMiddleware({
    //       target: 'http://kbase-ui-plugins:80',
    //       changeOrigin: true,
    //     })
    //   );
    app.use(
        pluginsRoot,
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/plugins/',
            changeOrigin: true,
            pathRewrite: { [`^${pluginsRoot}`]: '' }
        })
    );
    app.use(
        `${basePath}/modules/plugins`,
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/plugins/',
            changeOrigin: true,
            pathRewrite: { [`^${basePath}/modules/plugins`]: '' }
        })
    );
    app.use(
        `${basePath}/deploy/plugins`,
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/plugins/',
            changeOrigin: true,
            pathRewrite: { [`^${basePath}/deploy/plugins`]: '' }
        })
    );
    app.use(
        `${basePath}/plugins`,
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/plugins/',
            changeOrigin: true,
            pathRewrite: { [`^${basePath}/plugins`]: '' }
        })
    );
    app.use(
        `${basePath}/deploy`,
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/deploy/',
            changeOrigin: true,
            pathRewrite: {[`^${basePath}/deploy`]: '' }
        })
    );
    app.use(
        `${basePath}/build`,
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/build/',
            changeOrigin: true,
            pathRewrite: { [`^${basePath}/build`]: '' }
        })
    );
};