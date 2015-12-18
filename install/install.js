/*jslint white:true*/

'use strict';

var Promise = require('bluebird'),
    yaml = require('js-yaml'),
    ini = require('ini'),
    fs = Promise.promisifyAll(require('fs-extra')),
    underscore = require('underscore');

function rebuildConfig(targetPath) {
    return fs.statAsync(targetPath.join('/'))
        .then(function (stat) {
            if (!stat.isDirectory) {
                console.log('Target path not a directory: ' + targetPath.join('/'));
                process.exit(1);
            }
            return Promise.all([
                fs.readFileAsync(targetPath.concat(['deploy.cfg']).join('/'), 'utf8')
                    .then(function (contents) {
                        return ini.parse(contents);
                    }),
                fs.readFileAsync(targetPath.concat(['config', 'deploy', 'templates', 'service.yml']).join('/'), 'utf8')
            ]);
        })
        .spread(function (deployConfig, template) {
            var compiled = underscore.template(template),
                processed = compiled(deployConfig['kbase-ui']);
            return fs.writeFileAsync(targetPath.concat(['client', 'modules', 'config', 'service.yml']).join('/'), processed);
        });
}

function rebuildDeployConfig(targetPath, target) {
    var fileName = 'deploy-' + target + '.cfg',
        filePath = targetPath.concat(['config', 'deploy', fileName]);
    
    return fs.copyAsync(filePath.join('/'), targetPath.concat(['deploy.cfg']).join('/'))
        .then(function () {
            return target;
        });
}

module.exports = {
    rebuildDeployConfig: rebuildDeployConfig,
    rebuildConfig: rebuildConfig
};