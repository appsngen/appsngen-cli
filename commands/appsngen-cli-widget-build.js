var execSync = require('child_process').execSync;
var commander = require('commander');
var path = require('path');
var jsonfile = require('jsonfile');
var cordovacontroller = require('./../src/cordovacontroller');
var uploadcontroller = require('./../src/uploadcontroller');

var platform;
var rcFilePath = path.join(process.cwd(), '/.appsngenrc');
var rcConfig = jsonfile.readFileSync(rcFilePath);

commander
    .arguments('[platform]')
    .action(function (arg) {
        platform = arg;
    });
commander.parse(process.argv);

platform = platform || 'browser';
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
        if (platform !== '' && rcConfig.cordova.platforms.indexOf(platform) === -1) {
            cordovacontroller.addPlatform(platform);
        }
        cordovacontroller.modify();
    })
    .catch(function (error) {
        console.error(error.toString());
        process.exit(1);
    });