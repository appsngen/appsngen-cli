(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var path = require('path');
    var Promise = require('bluebird').Promise;
    var exec = Promise.promisify(require('child_process').exec);
    var readFile = Promise.promisify(require('jsonfile').readFile);
    var phonegapcontroller = require('./../src/phonegapcontroller');
    var uploadcontroller = require('./../src/uploadcontroller');
    var helper = require('./../src/clihelper');

    var platforms;
    var options, option;
    var verboseCall;
    var rcConfig; // add processing in case of rc file absence
    var commandOptions = ''; // options passed to phonegap build command
    var rcFilePath = path.join(process.cwd(), '.appsngenrc');

    program
        .option('--android', 'Build for android platform')
        .option('--ios', 'Build for ios platform')
        .option('--browser', 'Build for browser')
        .option('--release', 'Deploy a release build')
        .option('--browserify', 'Compile plugin JS at build time using browserify instead of runtime')
        .option('--buildConfig <configFile>', 'Use the specified build configuration file.')
        .option('--verbose', 'Logs all outputs from all actions')
        .parse(process.argv);

    options = program.opts();
    if (options.verbose) {
        verboseCall = true;
        options.verbose = null;
    }
    platforms = phonegapcontroller.parsePlatforms(options);
    platforms = platforms.length ? platforms : ['browser'];

    console.log('Start preparing widget package.');
    helper.startLoadingIndicator();
    exec('npm run grunt')
        .then(function (stdout) {
            helper.stopLoadingIndicator();
            if (verboseCall) {
                console.log(stdout);
            }
            console.log('Widget package successfully prepared.');
        })
        .then(function () {
            return readFile(rcFilePath);
        })
        .then(function (config) {
            rcConfig = config;
            console.log('Uploading widget package.');
            helper.startLoadingIndicator();
            return uploadcontroller.uploadWidget(rcConfig);
        })
        .then(function() {
            helper.stopLoadingIndicator();
            console.log('Widget package successfully uploaded.');
            console.log('Building PhonaGap application.');
            helper.startLoadingIndicator();
            return phonegapcontroller.modify();
        })
        .then(function () {
            for (option in options) {
                if (options[option]) {
                    if (typeof options[option] === 'boolean') {
                        commandOptions += ' --' + option;
                    } else {
                        commandOptions += ' --' + option + '=' + options[option];
                    }
                }
            }
            return exec('npm run phonegap-manipulation build ' + platforms.join(' ') +
                (commandOptions ? ' -- ' + commandOptions: ''));
        })
        .then(function (stdout) {
            helper.stopLoadingIndicator();
            if (verboseCall) {
                console.log(stdout);
            }
            console.log('PhoneGap application successfully built.');
        })
        .catch(function (error) {
            console.error(error.toString());
            process.exit(1);
        });
})();
