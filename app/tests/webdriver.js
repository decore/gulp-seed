(function() {
    'use strict';

    var fs = require('fs'),
        stylesheet = fs.readFileSync(__dirname + '/../dependencies/mocha/mocha.css', 'utf8'),
        script = '';

    [
        '/../dependencies/mocha/mocha.js',
        '/../dependencies/chai/chai.js',
        '/../../dist/tests.js',
    ].map(function(name) {
        return fs.readFileSync(__dirname + name, 'utf8');
    }).forEach(function(s) {
        script = script + s;
    });

    module.exports = {
        runOn: function(client, page, contentTagId) {
            client.init(function() {

                fs.readdirSync(__dirname + '/commands').forEach(function(name) {
                    client.addCommand(name, require('./commands/' + name).bind(client));
                });

                if (typeof page === 'undefined') {
                    page = 'http://localhost:7000';
                }

                if (typeof contentTagId === 'undefined') {
                    contentTagId = '#content';
                }

                client.url(page)
                    .waitFor(contentTagId)
                    .timeoutsAsyncScript(20000)
                    .executeAsync(function(stylesheet, script, done) {
                        window.testingDone = done;
                        document.body.innerHTML = '<div id="mocha"></div>';

                        var styleEl = document.createElement('style');
                        var styleAfter = document.getElementsByTagName('style')[0];
                        styleEl.type = 'text/css';
                        styleEl.textContent = stylesheet;
                        styleAfter.parentNode.insertBefore(styleEl, styleAfter);

                        var scriptAfter = document.getElementsByTagName('script')[0];
                        var scriptEl = document.createElement('script');
                        scriptEl.text = script;
                        scriptAfter.parentNode.insertBefore(scriptEl, scriptAfter);

                    }, stylesheet, script, function(err) {
                        if (err) {
                            console.log(err);
                        }

                        client.pause(3000).end();
                    });
            });
        }
    };

}());
