(function() {
    'use strict';

    var gulp = require('gulp'),
        shell = require('gulp-shell'),
        webdriverio = require('webdriverio');

    gulp.task('startLocalSeleniumServer', shell.task([
        '[ `ls node_modules/protractor/selenium | grep selenium-server | wc -l` -eq 1 ] || node_modules/protractor/bin/webdriver-manager update',
        'hash screen > /dev/null || echo -e \"\\e[0;31mPlease install GNU screen\\e[0m\"',
        '[ `netstat -nat | grep 4444 | wc -l` -eq 1 ] || screen -AmdS SeleniumServer node_modules/protractor/bin/webdriver-manager start',
    ]));

    gulp.task('watchTests', ['watchJavascripts'], function() {
        gulp.watch('dist/tests.js', ['test']);
    });

    gulp.task('test', function(cb) {
        var tests = require('../app/tests/node');
        tests.run(cb);
    });

    gulp.task('teste2e', ['javascripts', 'startLocalSeleniumServer'], function() {
        var capabilities = [
            require('../webdriverio/capabilities/chrome.js'),
            // require('../webdriverio/capabilities/firefox.js'),
            // require('../webdriverio/capabilities/safari.js')
        ];

        var tests = require('../app/tests/webdriver');
        capabilities.forEach(function(capability) {
            var client = webdriverio.remote({
                desiredCapabilities: capability
            });

            tests.runOn(client);
        });
    });

}());
