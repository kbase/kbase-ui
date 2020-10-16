/*eslint-env node*/


const Bluebird = require('bluebird');
const glob = Bluebird.promisify(require('glob').Glob);
const fs = Bluebird.promisifyAll(require('fs-extra'));


async function logLines(path) {
    const logRegexp = /console\.log\(/;
    const yamlPath = Array.isArray(path) ? path.join('/') : path;
    const contents = await fs.readFileAsync(yamlPath, 'utf8');
    const lines = contents.split('\n')
        .map((line, index) => {
            return {line, index};
        })
        .filter((line) => {
            return logRegexp.test(line.line);
        });

    return lines;
}

async function getSourceFileNames(type) {
    return await glob(`src/client/**/*.${type}`, {nodir: true});
}


function writeln(line) {
    process.stdout.write(`${line}\n`);
}

async function showConsoleLogs(type) {
    const files = await getSourceFileNames(type);
    writeln(`${type} files with console.log`);
    let count = 0;
    await Promise.all(files.map(async (fileName) => {
        const lines = await logLines(fileName);
        if (lines.length === 0) {
            return;
        }
        writeln(fileName);
        lines.forEach((line) => {
            count += 1;
            writeln(`${line.index}: ${line.line}`);
        });
    }));
    return count;
}


async function main() {
    let count = 0;
    count += await showConsoleLogs('js');
    count += await showConsoleLogs('ts');
    if (count > 0) {
        writeln(`Exiting with error due to ${count} console.log lines detected!`);
        process.exit(1);
    }
    writeln('No console.log lines detected');
    process.exit(0);
}

main();