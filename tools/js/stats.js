/*eslint-env node*/


const Bluebird = require('bluebird');
const glob = Bluebird.promisify(require('glob').Glob);
const path = require('path');
const fs = Bluebird.promisifyAll(require('fs-extra'));


async function loc(path) {
    const yamlPath = Array.isArray(path) ? path.join('/') : path;
    const contents = await fs.readFileAsync(yamlPath, 'utf8');
    const lines = contents.split('\n').filter((line) => {
        return line.trim().length > 0;
    });

    return lines.length;
}

async function main() {
    const clientFiles = await glob('src/client/**/*.*', {nodir: true});
    const pluginFiles = await glob('src/plugins/**/*.*', {nodir: true});
    const portFiles = await glob('src/client/modules/ports/**/*.*', {nodir: true});
    const allFiles = ([].concat(clientFiles, pluginFiles)).filter((file) => {
        return !portFiles.includes(file);
    });
    const stats = new Map();
    await Promise.all(allFiles.map(async (file) => {
        const extension = path.extname(file).slice(1);
        const stat = (() => {
            if (!stats.has(extension)) {
                stats.set(extension, {
                    count: 0,
                    loc: 0
                });
            }
            return stats.get(extension);
        })();
        stat.count += 1;
        const lineCount = await loc(file);
        stat.loc += lineCount;
    }));

    function showStats() {
        stats.forEach((stat, ext) => {
            process.stdout.write(`${ext} = ${stat.count}, ${stat.loc}\n`);
        });
    }

    function showStat(prop) {
        const codeFileCount = stats.get('js')[prop] + stats.get('ts')[prop];
        const jsPortion = Intl.NumberFormat('en-US', {style: 'percent'}).format(stats.get('js')[prop]/codeFileCount);
        const tsPortion = Intl.NumberFormat('en-US', {style: 'percent'}).format(stats.get('ts')[prop]/codeFileCount);
        process.stdout.write(`Percentage JS: ${jsPortion}\n`);
        process.stdout.write(`Percentage TS: ${tsPortion}\n`);
    }

    function totalLOC() {
        return stats.get('js')['loc'] + stats.get('ts')['loc'];
    }

    function showLOC(prop) {
        process.stdout.write(`${prop} = ${Intl.NumberFormat('en-US', {useGrouping: true}).format(stats.get(prop).loc)}\n`);
    }

    function showTotalLOC() {
        process.stdout.write(`Total: ${Intl.NumberFormat('en-US', {useGrouping: true}).format(totalLOC())}\n`);
    }

    showStats();

    process.stdout.write('\nPercent File Count\n');
    showStat('count');

    process.stdout.write('\nPercent LOC\n');
    showStat('loc');

    process.stdout.write('\nLOC\n');
    showLOC('ts');
    showLOC('js');
    showTotalLOC();
}

main();