var static = require('node-static');
var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var execAsync = Promise.promisify(require('child_process').exec);
var port = 8080;


function start() {
    var type = process.argv[3] || 'build',
        rootDir = path.normalize([__dirname, '..', type, 'client'].join('/')),
        title = 'kbup-' + String(port);
    process.title = title;
    if (!fs.existsSync(rootDir)) {
        console.log('root dir ' + rootDir + ' does not exist or is not accessible to you');
        return;
    }
    var file = new static.Server(rootDir, {cache: false});
    console.log('root: ' + rootDir);

    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            // 
            // Serve files! 
            // 
            file.serve(request, response)
                .addListener('error', function (err) {
                    console.log('ERROR: ' + request.url + ':' + err.message);
                });

        }).resume();
    }).listen(port);
    console.log('Preview started as process: ' + title + ', with id: ' + String(process.pid));
}

function stop() {
    // yeah, well, we'll improve this...
    var title = 'kbup-' + String(port);

    execAsync('ps -o pid,command')
        .then(function (stdout, stderr) {
            return stdout.toString()
                .split('\n')
                .map(function (item) {
                    return item.trim(' ').split(/[ ]+/);
                })
                .filter(function (row) {
                    if (row.length < 2) {
                        return false;
                    }
                    if (row[1] === title) {
                        return true;
                    }
                    return false;
                });            
        })
        .then(function (procs) {
            if (procs.length === 1) {
                var pid = parseInt(procs[0]);
                console.log('Killing process ' + title + ' with pid ' + pid);
                process.kill(pid);
            } else if (procs.length === 0) {
                console.log('No processes matched');
            } else {
                console.log('Too many processes matched ' + title);
            }
        });
}

function usage() {
    console.log('node server <cmd>');
}

switch (process.argv[2]) {
    case 'start':
        start();
        break;
    case 'stop':
        stop();
        break;
    default:
        usage();
}
