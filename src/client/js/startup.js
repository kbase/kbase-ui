/*global require*/
/*jslint white:true*/
require(['/js/require-config.js'], function() {
    'use strict';
    require(['kb_main'], function (main) {
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