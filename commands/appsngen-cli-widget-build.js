var execSync = require('child_process').execSync;
var program = require('commander');
var path = require('path');
var jsonfile = require('jsonfile');
var cordovacontroller = require('./../src/cordovacontroller');
var uploadcontroller = require('./../src/uploadcontroller');

var platforms, options, option;
var commandOptions = ''; // options passed to cordova build command
var rcFilePath = path.join(process.cwd(), '/.appsngenrc');
var rcConfig = jsonfile.readFileSync(rcFilePath);

program
    .option('--android', 'Build for android platform')
    .option('--ios', 'Build for ios platform')
    .option('--browser', 'Build for browser')
    .option('--release', 'Deploy a release build')
    .option('--browserify', 'Compile plugin JS at build time using browserify instead of runtime')
    .option('--buildConfig <configFile>', 'Use the specified build configuration file.')
    .parse(process.argv);

options = program.opts();
platforms = cordovacontroller.parsePlatforms(options);
if (platforms.length === 0) {
    platforms = ['browser'];
}
platforms = platforms || ['browser'];
execSync('grunt', {
    stdio: 'inherit'
});
uploadcontroller
    .uploadWidget(rcConfig)
    .then(function() {
        rcConfig = jsonfile.readFileSync(rcFilePath);
        if (typeof rcConfig.cordova === 'undefined') {
            cordovacontroller.create();
            rcConfig = jsonfile.readFileSync(rcFilePath);
        }
        platforms.forEach(function (platform) {
            if (rcConfig.cordova.platforms.indexOf(platform) === -1) {
                cordovacontroller.addPlatform(platform);
            }
        });
        cordovacontroller.modify();
        for (option in options) {
            if (options[option]) {
                if (typeof options[option] === 'boolean') {
                    commandOptions += ' --' + option;
                } else {
                    commandOptions += ' --' + option + '=' + options[option];
                }
            }
        }
        execSync('cordova build ' + platforms.join(' ') + commandOptions, {
            stdio: 'inherit',
            cwd: path.join(process.cwd(), '/cordova')
        });
    })
    .catch(function (error) {
        console.error(error);
        process.exit(1);
    });