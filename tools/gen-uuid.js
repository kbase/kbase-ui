/*eslint-env node */
/*eslint strict: ["error", "global"] */

'use strict';

function main() {
    var uuid4 = require('uuid/v4');

    var uuid = uuid4();
    console.log(uuid);
}

main();