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
    var port;
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
        .then(function prepareRequiredResources(config) {
            // set default platform if no platforms passed
            if (platforms.length === 0) {
                platforms = ['browser'];
            }
            if (platforms.indexOf('browser') !== -1) {
                port = config.port;
                runArgs += [' -- --port=' + port];
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
        .then(function checkPortStatus() {
            return new Promise(function (resolve, reject) {
                var net = require('net');
                var tester = net.createServer()
                    .once('error', function (error) {
                        if (error.code !== 'EADDRINUSE') {
                            reject(error);
                        }

                        // selected port in use
                        console.error('\b\rError: port ' + port + ' in use.' +
                                      '\nOperation aborted.');
                        process.exit(1);
                    })
                    .once('listening', function() {
                        tester
                            .once('close', function() {
                                resolve();
                            })
                            .close();
                    })
                    .listen(port);
            });
        })
        .then(function runPhonegapApplication(stdout) {
            if (!program.nobuild) {
                if (verboseCall) {
                    console.log(stdout);
                }
                console.log('\b\rBuild completed.');
            }

            console.log('\b\rStart running application.' +
                        '\n Server running at http://localhost:' + port +
                        '\n CTRL + C to shutdown server.');
            return exec('npm run phonegap-manipulation run ' + platforms.join(' ') +
                (runArgs ? ' -- ' + runArgs : ''), {
                    cwd: phonegapPath
                });
        })
        .catch(function (error) {
            if (verboseCall) {
                console.error('Error: ' + error.toString());
            } else {
                console.error('\nError: build failed. Try run with --verbose for more information.');
            }
            process.exit(1);
        });
})();
