/*jslint white:true*/

'use strict';

var Promise = require('bluebird'),
    yaml = require('js-yaml'),
    ini = require('ini'),
    fs = Promise.promisifyAll(require('fs-extra')),
    underscore = require('underscore');

function rebuildConfig(sourcePath, deployName, deployPath) {
    var fileName = 'deploy-' + deployName + '.cfg',
        filePath = sourcePath.concat(['config', 'deploy', fileName]),
        destPath = deployPath.concat(['client', 'modules', 'config', 'service.yml']);

    return fs.accessAsync(destPath.join('/'), fs.R_OK | fs.W_OK)
        .then(function () {
            return Promise.all([
                fs.readFileAsync(filePath.join('/'), 'utf8')
                    .then(function (contents) {
                        return ini.parse(contents);
                    }),
                fs.readFileAsync(sourcePath.concat(['config', 'deploy', 'templates', 'service.yml']).join('/'), 'utf8')
            ])
        })
        .spread(function (deployConfig, template) {
            var compiled = underscore.template(template),
                processed = compiled(deployConfig['kbase-ui']);
            // return processed;
            return fs.writeFileAsync(deployPath.concat(['client', 'modules', 'config', 'service.yml']).join('/'), processed);
        });
}


//function rebuildServiceConfig(root, target) {
//    var fileName = 'deploy-' + target + '.cfg',
//        filePath = root.concat(['config', 'deploy', fileName]),
//        templatePath = root.concat(['config', 'deploy', 'templates', ''])
//    
//    return fs.copyAsync(filePath.join('/'), targetPath.concat(['deploy.cfg']).join('/'))
//        .then(function () {
//            return target;
//        });
//}


module.exports = {
    // rebuildDeployConfig: rebuildDeployConfig,
    rebuildConfig: rebuildConfig
};