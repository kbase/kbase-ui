var Proxy = require('http-proxy');

var proxy = Proxy.createProxyServer({
    target: 'https://ci.kbase.us',
    headers: {
        host: 'ci.kbase.us'
    }
});
proxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('host', 'ci.kbase.us');
    console.log('proxying...');
    console.log(proxyReq);
});

var http = require('http');

var server = http.createServer(function (req, res) {
    proxy.web(req, res, {
        target: 'https://ci.kbase.us'
    });
});

server.listen(8000);
