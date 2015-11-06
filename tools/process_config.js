/**
 * process_config.js
 * -----------------
 * A tiny node script that will read in a set of configured service
 * endpoints and inject them into the lodash-templatized config file.
 *
 * This also concatenates that template file with a more kbase-ui 
 * focused non-templated settings file.
 *
 * Usage: from root of this repo
 * > node tools/process_config.js [ini file, default = deploy.cfg]
 *
 * This script expects that the given config file is in INI format,
 * and contains a [kbase-ui] stanza.
 * @author Bill Riehl wjriehl@lbl.gov
 */

'use strict';
var iniParser = require('node-ini');
var fs = require('fs');
var _ = require('lodash');

/* Getting service config - nested options.
 * default = local deploy.cfg
 * if one is passed in an argument, use that and move on
 * if environment var KB_DEPLOYMENT_CONFIG is available (and nothing
 * passed in), use that.
 */
var deployCfgFile = 'deploy.cfg';
if (process.argv.length > 2) {
    deployCfgFile = process.argv[2];
}
else if (process.env.KB_DEPLOYMENT_CONFIG) {
    deployCfgFile = process.env.KB_DEPLOYMENT_CONFIG;
}
console.log('Building configuration from ' + deployCfgFile);
var serviceTemplateFile = 'config/service-config-template.yml';
var settingsCfg = 'config/settings.yml';
var outFile = 'build/client/config.yml';

/* Admittedly, this is a little sloppy. It loads the 
 * ini file synchronously with the node-ini package,
 * then loads the template asynchronously. Next, it uses 
 * lodash to populate the template, then loads the settings 
 * file (also async - I hate nesting these, but it's a bit
 * more compact in this case), concats them, and writes them
 * out to the right place.
 */
var deployCfg = iniParser.parseSync(deployCfgFile);
fs.readFile(serviceTemplateFile, 'utf8', function(err, serviceTemplate) {
    if (err) return showError('Error reading service template');

    var compiled = _.template(serviceTemplate);
    var services = compiled(deployCfg['kbase-ui']);

    fs.readFile(settingsCfg, 'utf8', function(err, settings) {
        if (err) return showError('Error reading UI settings file', err);

        fs.writeFile(outFile, services + '\n\n' + settings, function(err) {
            if (err) return showError('Error writing compiled configuration', err);
        });
    });
});
console.log('Done! Configuration written to ' + outFile);

/**
 * Writes an error to the console in a somewhat pretty way.
 * Takes a (supposedly) human-readable string as well as the
 * usual nodejs error object.
 */
function showError(str, err) {
    console.log("An error occurred while processing configuration:\n");
    if (str) console.log(str);
    if (err) console.log(err);
}