(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var execSync = require('child_process').execSync;
    var path = require('path');
    var jsonfile = require('jsonfile');
    var cordovacontroller = require('./../src/cordovacontroller');

    var platforms, config, options, option, tmpString;
    var buildArgs = '';
    var runArgs = '';
    var cordovaPath = path.join(process.cwd(), 'cordova');
    var buildAcceptableArgs = ['release', 'browserify', 'buildConfig'];

    program
        .option('--android', 'Build for android platform')
        .option('--ios', 'Build for ios platform')
        .option('--browser', 'Build for browser')
        .option('--list', 'Lists available targets')
        .option('--release', 'Deploy a release build')
        .option('--nobuild', 'Skip building')
        .option('--browserify', 'Compile plugin JS at build time using browserify instead of runtime')
        .option('--target <targetDevice>', 'Deploy to specific target')
        .option('--buildConfig <configFile>', 'Use the specified build configuration file.')
        .parse(process.argv);

    options = program.opts();
    platforms = cordovacontroller.parsePlatforms(options);

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

    try {
        config = jsonfile.readFileSync(path.join(process.cwd(), './.appsngenrc'));


        //set default platform if no platforms passed
        if (platforms.length === 0) {
            platforms = ['browser'];
        }
        if (platforms.indexOf('browser') !== -1) {
            runArgs += [' -- --port=' + config.port];
        }

        //skip building phase if call with --nobuild flag, and check
        //does required platform was built before
        if (!program.nobuild) {
            execSync('appsngen widget build --' + platforms.join(' --') + buildArgs, {
                stdio: 'inherit'
            });
        } else {
            if (!config.cordova || !platforms.every(function (el) {
                return config.cordova.indexOf(el) !== -1;
            })) {
                throw 'Required platforms wasn\'t built yet.';
            }
        }
        execSync('npm run cordova-manipulation run ' + platforms.join(' ') + (runArgs ? ' -- ' + runArgs : ''), {
            stdio: 'inherit',
            cwd: cordovaPath
        });
    } catch (error) {
        console.error(error.toString());
        process.exit(1);
    }
})();