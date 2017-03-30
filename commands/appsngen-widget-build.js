(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var Promise = require('bluebird').Promise;
    var exec = Promise.promisify(require('child_process').exec);
    var helper = require('./../src/clihelper');

    var options;
    var verboseCall;

    program
        .option('--verbose', 'Logs all outputs from all actions.')
        .parse(process.argv);

    options = program.opts();
    if (options.verbose) {
        verboseCall = true;
        options.verbose = null;
    }

    console.log('Start preparing widget package.');
    helper.startLoadingIndicator();
    exec('npm run grunt')
        .then(function logBuildInformation(stdout) {
            if (verboseCall) {
                console.log(stdout);
            }
            helper.stopLoadingIndicator();
            console.log('\b\rWidget package successfully prepared.');
        })
        .catch(function (error) {
            if (verboseCall) {
                console.error(error.toString());
            } else {
                console.error('\nError: build failed. Try run with --verbose for more information.');
            }
            process.exit(1);
        });
})();
