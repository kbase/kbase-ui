/*global require*/
/*jslint white:true*/
require(['require-config'], function() {
    'use strict';
    require(['app/main'], function (main) {
        main.start()
            .catch(function (err) {
                document.getElementById('root').innerHTML = 'Error starting KBase UI. Please consult the browser error log.';
                console.error('app is unhappy :(');
                console.errro(err);
            });
    });
});