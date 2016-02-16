/*jslint white:true*/

/*
 * Replace the deploy configuruation if a target is specified, and 
 * in any case update the build/dist config with rebuild config files.
 */

var install = require('./install'),
    Promise = require('bluebird');

function parseArgs() {
    var args = [], options = {};
    process.argv.slice(2).forEach(function (arg) {
        var parts = arg.split(/=/);
        if (parts.length === 1) {
            args.push(arg);
        } else {
            options[parts[0]] = parts[1];
        }
    });
    return {
        args: args,
        options: options
    };
}

var args = parseArgs();

var deployName = args.args[0],
    deployPath = args.args[1],
    sourcePath = args.options.source;

function usage(message) {
    var usageTemplate = 'node reconfigure <deploy name> [deploy path]';
    console.log(usageTemplate + ': ' + message);
}

if (!deployName) {
    usage('deploy name missing');
    process.exit(1);
}

if (!deployPath) {
    deployPath = '/kb/deployment/services/kbase-ui';
}

if (!sourcePath) {
    sourcePath = '..';
}


console.log('Okay, I will redeploy ' + deployName + ' to ' + deployPath + ' from ' + sourcePath);

// 

//if (targetDir) {
//    targetPath = targetDir.split('/');
//} else {
//    targetPath = ['..', 'dist'];
//}
//
    install.rebuildConfig(sourcePath.split('/'), deployName, deployPath.split('/'))
    .then(function () {
        console.log('Config successfully rebuilt and installed');
    })
    .catch(function (err) {
        console.log('ERROR');
        console.log(err);
        process.exit(1);
    });
//    .then(function () {
//        console.log('Rebuilding and installing kbase-ui service config');
//        return install.rebuildConfig(targetPath);
//    })
//    .catch(function (err) {
//        console.log('ERROR');
//        console.log(err);
//        process.exit(1);
//    });
