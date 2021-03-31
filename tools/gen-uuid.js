/*eslint-env node */
/*eslint strict: ["error", "global"], no-console: 0 */

'use strict';

function main() {
    const {v4: uuidv4}  = require('uuid');

    const uuid = uuidv4();
    console.log(uuid);
}

main();