(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var Promise = require('bluebird').Promise;
    var exec = Promise.promisify(require('child_process').exec);
    var readFile = Promise.promisify(require('jsonfile').readFile);
    var path = require('path');
    var phonegapcontroller = require('./../src/phonegapcontroller');
    var helper = require('./../src/clihelper');

    var platforms, options, option, tmpString;
    var verboseCall;
    var buildArgs = '';
    var runArgs = '';
    var phonegapPath = path.join(process.cwd(), 'phonegap');
    var buildAcceptableArgs = ['release', 'browserify', 'buildConfig'];

    program
        .option('--android', 'Build for android platform.')
        .option('--ios', 'Build for ios platform.')
        .option('--browser', 'Build for browser.')
        .option('--list', 'Lists available targets.')
        .option('--release', 'Deploy a release build.')
        .option('--nobuild', 'Skip building phase.')
        .option('--browserify', 'Compile plugin JS at build time using browserify instead of runtime.')
        .option('--target <targetDevice>', 'Deploy to specific target.')
        .option('--buildConfig <configFile>', 'Use the specified build configuration file.')
        .option('--verbose', 'Logs all outputs from all actions.')
        .parse(process.argv);

    options = program.opts();
    if (options.verbose) {
        verboseCall = true;
        options.verbose = null;
    }
    platforms = phonegapcontroller.parsePlatforms(options);

    for (option in options) {
        if (options[option]) {
            if (typeof options[option] === 'boolean') {
                tmpString = ' --' + option;
            } else {
                tmpString = ' --' + option + '=' + options[option];
            }
            runArgs += tmpString;
            if (buildAcceptableArgs.indexOf(option) !== -1) {
                buildArgs += tmpString;
            }
        }
    }

    readFile(path.join(process.cwd(), '.appsngenrc'))
        .then(function (config) {
            // set default platform if no platforms passed
            if (platforms.length === 0) {
                platforms = ['browser'];
            }
            if (platforms.indexOf('browser') !== -1) {
                runArgs += [' -- --port=' + config.port];
            }

            // skip building phase if call with --nobuild flag
            if (!program.nobuild) {
                console.log('Start building.');
                helper.startLoadingIndicator();
                return exec('appsngen widget build ' + (verboseCall ? ' --verbose' : '') +
                    ' --' + platforms.join(' --') + buildArgs);
            } else {
                return Promise.resolve();
            }
        })
        .then(function (stdout) {
            if (!program.nobuild) {
                helper.stopLoadingIndicator();
                if (verboseCall) {
                    console.log(stdout);
                }
                console.log('Build completed.');
            }

            console.log('Start running application.');
            helper.startLoadingIndicator();
            return exec('npm run phonegap-manipulation run ' + platforms.join(' ') +
                (runArgs ? ' -- ' + runArgs : ''), {
                    cwd: phonegapPath
                });
        })
        .then(function (stdout) {
            helper.stopLoadingIndicator();
            if (verboseCall) {
                console.log(stdout);
            }
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
