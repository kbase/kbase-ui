// setup

let webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

let firefox = require('selenium-webdriver/firefox');

let binary = new firefox.Binary(firefox.Channel.NIGHTLY);
binary.addArguments('-headless');

// let driver = new webdriver.Builder()
//     .forBrowser('firefox')
//     .setFirefoxOptions(new firefox.Options().setBinary(binary))
//     .build();

let firefoxOptions = new firefox.Options();
firefoxOptions.setBinary('');
firefoxOptions.headless();

const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(firefoxOptions)
    .build();

// the test

driver.get('https://www.google.com');
driver.findElement(By.name('q')).sendKeys('webdriver');

driver.sleep(1000).then(function() {
    driver.findElement(By.name('q')).sendKeys(webdriver.Key.TAB);
});

driver.findElement(By.name('btnK')).click();

driver.sleep(2000).then(function () {
    driver.getTitle().then(function (title) {
        if (title === 'webdriver - Google Search') {
            console.log('OK');
        } else {
            console.log('BOO');
        }
    });
});

driver.quit();