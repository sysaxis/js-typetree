"use strict";

const Mocha = require('mocha');

const mocha = new Mocha({
    ui: 'qunit',
    timeout: false
});

mocha.addFile('./test/validateObject');

mocha.run(function(failures) {
    process.exitCode = failures ? 1 : 0;
    process.exit();
});

