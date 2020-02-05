var Promise = require("bluebird"),
    fs = Promise.promisifyAll(require("fs-extra"));
// glob = Promise.promisify(require("glob").Glob),
// yaml = require("js-yaml"),
// ini = require("ini"),
// chalk = require("chalk"),
// uniqState = {};

function loadJson(path) {
    return fs.readFileAsync(path.join("/"), "utf8").then(function (contents) {
        return JSON.parse(contents);
    });
}

function main() {
    const root = process.cwd();
    console.log(`Running package diff in ${root}...`);
    const
}

main();