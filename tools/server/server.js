var Promise = require('bluebird');
var static = require('node-static');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var execAsync = Promise.promisify(require('child_process').exec);
var open = require('open');
var yaml = require('js-yaml');

function loadYaml(path) {
    var yamlPath = path.join('/');
    return fs.readFileAsync(yamlPath, 'utf8')
        .then(function (contents) {
            return yaml.safeLoad(contents);
        });
}

function loadBuildConfig(state) {
    return loadYaml(['..', '..', 'dev', 'config', 'build.yml']);
}


function start (config) {
    var type = process.argv[3] || 'build',
	rootDir, 
        port = config.server.port,
        title = 'kbup-' + String(port);
        
    
    console.log('Starting local kbase-ui server');
    console.log('Type: ' + type);
    console.log('Port: ' + port);

    if (type === 'deployed') {
	// TODO: get this from the deploy config
	rootDir = '/kb/deployment/ui-common/';
    } else {
        rootDir = path.normalize([__dirname, '..', '..', 'build', type, 'client'].join('/'));
    }
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
    console.log('Preview server started as process: ' + title + ', with id: ' + String(process.pid));
}

function getServerPid(port) {
    return execAsync('ps -o pid,command')
        .then(function (stdout, stderr) {
            var title = 'kbup-' + String(port);
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
                return pid;
            } else if (procs.length === 0) {
                throw new Error('No processes matched');
            } else {
               throw new ('Too many processes matched ' + title);
            }
        });
}

function stop(config) {
    // yeah, well, we'll improve this...
    getServerPid(config.server.port)
        .then(function (pid) {
            process.kill(pid);
        });
}

function preview(config) {
    getServerPid(config.server.port)
        .then(function () {
            var port = config.server.port;
            var url = 'http://localhost:' + String(port);
            console.log('Opening browser for ' + url);
            open(url);
        })
        .catch(function (err) {
            console.log('Cannot preview the site -- server not started');
        });
}

function usage() {
    console.log('node server <cmd>');
}

loadBuildConfig()
    .then(function (config) {
        switch (process.argv[2]) {
            case 'start':
                start(config);
                break;
            case 'stop':
                stop(config);
                break;
            case 'preview':
                preview(config);
                break;
            default:
                usage(config);
        }
    })
    .catch(function (err) {
        console.log('ERROR');
        console.log(err);
        usage();
    });
