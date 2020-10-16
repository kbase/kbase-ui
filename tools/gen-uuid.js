/*eslint-env node */
/*eslint strict: ["error", "global"], no-console: 0 */

'use strict';

function main() {
    var uuid4 = require('uuid/v4');

    var uuid = uuid4();
    console.log(uuid);
}

main();