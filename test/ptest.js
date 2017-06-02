var phantomjs = require('phantomjs-prebuilt');
var webdriverio = require('webdriverio');
var wdOpts = {
    desiredCapabilities: {
        browserName: 'phantomjs',
        'phantomjs.cli.args': ['--web-security=no', '--ssl-protocols=any', '--ignore-ssl-errors=true']
    }
};

phantomjs.run('--webdriver=4444 --ignore-ssl-errors=true').then(function (program) {
    var client = webdriverio.remote(wdOpts);
    client.init()
        .url('https://ci.kbase.us')
        .then(function (what) {
            console.log('what?', what);
            return what;
        })
        .waitForExist('.kb-widget-title', 5000)
        .getTitle()
        .then(function (title) {
            console.log('title is ...', title);
        })
        .end()
        .then(function (what) {
            console.log('done?', what);
            return what;
        })
        .catch(function (err) {
            console.error('error?', err);
        })
        .finally(function () {
            program.kill();
        });
    // var title = w.getTitle();
    // console.log(title);
    // program.kill();
    // .url('https://developer.mozilla.org/en-US/')
    // .getTitle().then(title => {
    //     console.log(title) // 'Mozilla Developer Network' 
    //     program.kill() // quits PhantomJS 
    // })
});
