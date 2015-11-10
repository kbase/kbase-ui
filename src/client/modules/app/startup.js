/*global require*/
/*jslint white:true*/
require(['require-config'], function() {
    'use strict';
    require(['app/main'], function (main) {
        main.start()
            .then(function () {
                console.log('app has started!');
            })
            .catch(function (err) {
                document.getElementById('root').innerHTML = 'My gosh, I am not a happy camper. Please check the browser console.';
                console.log('app is unhappy :(');
                console.log(err);
            });
    });
});