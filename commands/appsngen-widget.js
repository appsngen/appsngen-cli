#! /usr/bin/env node

var program = require('./../src/customcommander');
var authcontroller = require('./../src/authcontroller');
var execSync = require('child_process').execSync;
var helper = require('./../src/clihelper');

var ADDRESSABLE_COMMANDS = [
    'build',
    'run',
    'preview',
    'deploy'
];
var callWithName;

try {
    if (!authcontroller.isAuthorized()) {
        execSync('appsngen login', {
            stdio: 'inherit'
        });
    }
    if (ADDRESSABLE_COMMANDS.indexOf(process.argv[2]) !== -1) {
        callWithName = process.argv.length >= 4 &&
            process.argv[3].indexOf('-') !== 0; //check 4th argument isn't option
        if (callWithName) {
            helper.workByWidgetName(process.argv[3]);
        } else if (!helper.isProjectFolder('.')) {
            throw 'Current folder isn\'t appsngen widget project.';
        }
    }
} catch (error) {
    if (error.cmd && error.cmd === 'appsngen login') {
        console.log('You should login to appsngen.');
    } else {
        console.error(error.toString());
    }
    process.exit(1);
}

helper.normalizePathToCurrentFile();

program
    .alias('appsngen widget')
    .usage('[command]')
    .command('create', 'creates widget')
    .command('build', 'builds widget sources')
    .command('run', 'runs widget locally')
    .command('preview', 'preview widget at AppsNgen')
    .command('deploy', 'deploys widget to AppsNgen')
    .command('remote', 'set of commands to work with PhoneGap Build service')
    .command('list', 'print widgets list')
    .parse(process.argv);