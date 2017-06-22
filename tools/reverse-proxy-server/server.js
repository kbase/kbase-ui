// var Proxy = require('http-proxy');

// var proxy = Proxy.createProxyServer({
//     target: 'https://ci.kbase.us',
//     headers: {
//         host: 'ci.kbase.us'
//     }
// });
// proxy.on('proxyReq', function (proxyReq, req, res, options) {
//     proxyReq.setHeader('host', 'ci.kbase.us');
//     console.log('proxying...');
//     console.log(proxyReq);
// });

// var http = require('http');

// var server = http.createServer(function (req, res) {
//     proxy.web(req, res, {
//         target: 'https://ci.kbase.us'
//     });
// });

// server.listen(8000);

var proxy = require('express-http-proxy');

var express = require('express');

var path = require('path');

var app = express();

app.use('/services', proxy('ci.kbase.us/services'));

var dir = path.join(__dirname, 'test');
console.log('Serving files out of ' + dir);
app.use(express.static(dir));

app.listen(3003, function () {
    console.log('Starting proxy/server on 3003...');
});
