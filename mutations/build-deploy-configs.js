/*
 * build-deploy-config.js
 
 *
 */

/*eslint-env node */
/*eslint strict: ["error", "global"] */
"use strict";

var Promise = require("bluebird"),
  fs = Promise.promisifyAll(require("fs-extra")),
  path = require("path"),
  mutant = require("./mutant"),
  glob = Promise.promisify(require("glob").Glob),
  exec = require("child_process").exec;

function makeDeployConfig(templatePath, envFilesDir, destinationDir) {
  // var root = state.environment.path;
  // var cfgDir = root.concat(['build', 'deploy', 'cfg']);
  // var sourceDir = root.concat(['config', 'deploy']);

  // make deploy dir
  return fs
    .mkdirsAsync(destinationDir)
    .then(function() {
      // read yaml an write json deploy configs.
      return glob(envFilesDir + "/*.env", {
        nodir: true
      });
    })
    .then(function(matches) {
      return Promise.all(
        matches.map(function(match) {
          var baseName = path.basename(match, ".env");

          var outputPath = destinationDir + "/" + baseName + ".json";

          var envPath = match;

          return mutant.loadDockerEnvFile(envPath).then(function(templateVars) {
            var envVars = Object.assign({}, process.env, templateVars);

            var cmd = ["dockerize", "-template", templatePath + ":" + outputPath].join(" ");

            return new Promise(function(resolve, reject) {
              exec(
                cmd,
                {
                  env: envVars
                },
                function(error, stdout, stderr) {
                  if (error) {
                    reject(stderr);
                  } else {
                    resolve(stdout);
                  }
                }
              );
            });
          });
        })
      );
    })
    .catch(function(error) {
      console.error("ERROR", error);
    });

  // save the deploy script
}

function main(cfgDir, sourceDir, destinationDir) {
  return makeDeployConfig(cfgDir, sourceDir, destinationDir);
}

function usage() {
  console.error("usage: node build-deploy-configs <config-dir> <source-dir> <destination-dir>");
}

var configTemplate = process.argv[2];
if (configTemplate === undefined) {
  console.error("Config template file not specified");
  usage();
  process.exit(1);
}

var envFilesDir = process.argv[3];
if (envFilesDir === undefined) {
  console.error("Environment file directory not specified");
  usage();
  process.exit(1);
}

var outputDir = process.argv[4];
if (outputDir === undefined) {
  console.error("Output directory not specified");
  usage();
  process.exit(1);
}

main(configTemplate, envFilesDir, outputDir);
