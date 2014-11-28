(function() {
    'use strict';

    window.assert = window.chai.assert;

    window.mocha.setup({
        ui: 'bdd',
        ignoreLeaks: false,
        asyncOnly: true
    });

    try {

    } catch(e) {
        console.log(e);
    }

    window.mocha.checkLeaks();
    window.mocha.run(window.testingDone);

}());
