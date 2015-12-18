/*jslint white:true*/

/*
 * Replace the deploy configuruation if a target is specified, and 
 * in any case update the build/dist config with rebuild config files.
 */

var install = require('./install'),
    Promise = require('bluebird');

var targetDir = process.argv[2],
    target = process.argv[3],
    targetPath;

if (targetDir) {
    targetPath = targetDir.split('/');
} else {
    targetPath = ['..', 'dist'];
}

Promise.try(function () {
    if (target) {
        console.log('Rebuilding deploy config for target ' + target);
        return install.rebuildDeployConfig(targetPath, target);
    }
})
    .then(function () {
        console.log('Rebuilding and installing kbase-ui service config');
        return install.rebuildConfig(targetPath);
    })
    .catch(function (err) {
        console.log('ERROR');
        console.log(err);
        process.exit(1);
    });
