// Look for all .ts files

const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs-extra'));
const glob = Bluebird.promisify(require('glob').Glob);
const mutant = require('./mutant');

async function main() {
    const files = await glob('src/client/**/*.ts', {nodir: true});
    files.forEach(async (file) => {
        const [, base] = /^(.*)[.]ts$/.exec(file);
        if (!base) {
            console.warn('weird, not a ts file?', file);
            return;
        }
        const jsFile = `${base}.js`;
        if (! await fs.pathExists(jsFile)) {
            mutant.warn(`Not found, ignored: ${jsFile}`);
        } else {
            await fs.unlink(jsFile);
            mutant.success(`Removed ${jsFile}`);
        }
    });
}

main();