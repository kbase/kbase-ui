var Promise = require('bluebird');
var static = require('node-static');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var execAsync = Promise.promisify(require('child_process').exec);
var open = require('open');
var yaml = require('js-yaml');
var pathExists = require('path-exists');

function loadYaml(path) {
    var yamlPath = path.join('/');
    return fs.readFileAsync(yamlPath, 'utf8')
        .then(function (contents) {
            return yaml.safeLoad(contents);
        });
}

function loadBuildConfig(state) {
    return Promise.resolve(pathExists('../../dev/config'))
        .then(function (devExists) {
            var configRoot;
            if (devExists) {
                configRoot = ['..', '..', 'dev', 'config'];
                return [configRoot, loadYaml(configRoot.concat(['builds', state.args.type + '.yml']))];
            } else {
                configRoot = ['..', '..','config'];
                return [configRoot, loadYaml(configRoot.concat(['builds', state.args.type + '.yml']))];
            }
        })
        .spread(function (configRoot, config) {
            state.config.build = config;
            state.config.root = configRoot;
            return state;
        });
}


function start(state) {
    var type = state.args.type,
        rootDir,
        port = state.config.build.server.port,
        title = 'kbup-' + String(port);


    console.log('Starting local kbase-ui server');
    console.log('Type: ' + type);
    console.log('Port: ' + port);
    console.log(state);

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
    var title;
    return execAsync('ps -o pid,command')
        .then(function (stdout, stderr) {
            title = 'kbup-' + String(port);
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
                throw new Error('No processes matched ' + title);
            } else {
                throw new ('Too many processes matched ' + title);
            }
        });
}

function stop(state) {
    // yeah, well, we'll improve this...
    console.log('Stopping server on port ' + state.config.build.server.port);
    getServerPid(state.config.build.server.port)
        .then(function (pid) {
            console.log('PID: ' + pid);
            process.kill(pid);
        });
}

function preview(state) {
    getServerPid(state.config.build.server.port)
        .then(function () {
            var port = state.config.build.server.port;
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

function main(state) {
    loadBuildConfig(state)
        .then(function (state) {
            switch (state.args.action) {
                case 'start':
                    start(state);
                    break;
                case 'stop':
                    stop(state);
                    break;
                case 'preview':
                    preview(state);
                    break;
                default:
                    usage(state);
            }
        })
        .catch(function (err) {
            console.log('ERROR');
            console.log(err);
            usage();
        });
}


var action = process.argv[2];
if (action === undefined) {
    throw new Error('action required: node server <action> <type>');
}
var type = process.argv[3] || 'build';

main({
    args: {
        action:action,
        type: type
    },
    config: {
        
    }
});