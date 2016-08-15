(function () {
    'use strict';

    var execSync = require('child_process').execSync;
    var program = require('./../src/customcommander');
    var path = require('path');
    var jsonfile = require('jsonfile');
    var phonegapcontroller = require('./../src/phonegapcontroller');
    var uploadcontroller = require('./../src/uploadcontroller');

    var platforms, options, option;
    var commandOptions = ''; // options passed to phonegap build command
    var rcFilePath = path.join(process.cwd(), '.appsngenrc');
    var rcConfig = jsonfile.readFileSync(rcFilePath); // add processing in case of rc file absence

    program
        .option('--android', 'Build for android platform')
        .option('--ios', 'Build for ios platform')
        .option('--browser', 'Build for browser')
        .option('--release', 'Deploy a release build')
        .option('--browserify', 'Compile plugin JS at build time using browserify instead of runtime')
        .option('--buildConfig <configFile>', 'Use the specified build configuration file.')
        .parse(process.argv);

    options = program.opts();
    platforms = phonegapcontroller.parsePlatforms(options);
    platforms = platforms.length ? platforms : ['browser'];
    execSync('npm run grunt', {
        stdio: 'inherit'
    });
    uploadcontroller
        .uploadWidget(rcConfig)
        .then(function() {
            if (typeof rcConfig.phonegap === 'undefined') {
                return phonegapcontroller.create();
            }
        })
        .then(function () {
            phonegapcontroller.modify();
            for (option in options) {
                if (options[option]) {
                    if (typeof options[option] === 'boolean') {
                        commandOptions += ' --' + option;
                    } else {
                        commandOptions += ' --' + option + '=' + options[option];
                    }
                }
            }
            execSync('npm run phonegap-manipulation build ' + platforms.join(' ') +
                (commandOptions ? ' -- ' + commandOptions: ''), {
                    stdio: 'inherit'
                });
        })
        .catch(function (error) {
            console.error(error);
            process.exit(1);
        });
})();
