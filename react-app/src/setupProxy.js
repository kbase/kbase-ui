const { createProxyMiddleware, re } = require('http-proxy-middleware');

// Strangely, /index.html is the root path that CRA dev container sets.
const pluginsRoot = '/index.html/deploy/plugins/';

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
        '/modules/plugins',
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/plugins/',
            changeOrigin: true,
            pathRewrite: { '^/modules/plugins': '' }
        })
    );
    app.use(
        '/deploy/plugins',
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/plugins/',
            changeOrigin: true,
            pathRewrite: { '^/deploy/plugins': '' }
        })
    );
    app.use(
        '/plugins',
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/plugins/',
            changeOrigin: true,
            pathRewrite: { '^/plugins': '' }
        })
    );
    app.use(
        '/deploy',
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/deploy/',
            changeOrigin: true,
            pathRewrite: { '^/deploy': '' }
        })
    );
    app.use(
        '/build',
        createProxyMiddleware({
            target: 'http://kbase-ui-deploy:80/build/',
            changeOrigin: true,
            pathRewrite: { '^/build': '' }
        })
    );
};