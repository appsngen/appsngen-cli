var config = require('./../cli-config.json');
var execSync = require('child_process').execSync;
var fs = require('fs');
var commander = require('commander');
var path = require('path');
var jsonfile = require('jsonfile');
var cordovacontroller = require('./../src/cordovacontroller');

var platform, projectConfig;
var rcfilePath = path.join(process.cwd(), '/.appsngenrc');

commander
    .arguments('[platform]')
    .action(function (arg) {
        platform = arg || 'browser';
    });
commander.parse(process.argv);

execSync('grunt', {
    stdio: 'inherit'
});
execSync('appsngen widget deploy', {
    stdio: 'inherit'
});

try {
    projectConfig = jsonfile.readFileSync(rcfilePath);
    if (typeof projectConfig.cordova === 'undefined') {
        cordovacontroller.create();
        projectConfig = jsonfile.readFileSync(rcfilePath);
    }
    if (platform !== '' && projectConfig.cordova.platforms.indexOf(platform) === -1) {
        cordovacontroller.addPlatform(platform);
    }
    cordovacontroller.modify();
} catch (error) {
    console.error(error.toString());
    process.exit(1);
}