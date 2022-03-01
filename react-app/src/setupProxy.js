const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
//   app.use(
//     '/plugins',
//     createProxyMiddleware({
//       target: 'http://kbase-ui-plugins:80',
//       changeOrigin: true,
//     })
//   );
   app.use(
    '/index.html/public/deploy',
    createProxyMiddleware({
      target: 'http://kbase-ui-deploy:80',
      changeOrigin: true,
    })
  );
};