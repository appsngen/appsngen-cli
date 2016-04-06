#! /usr/bin/env node

var program = require('commander');
var path = require('path');
var authcontroller = require('./../src/authcontroller');
var execSync = require('child_process').execSync;
var helper = require('./../src/clihelper');

helper.normalizePathToCurrentFile();

try {
    if (!authcontroller.isAuthorized()) {
        execSync('appsngen login', {
            stdio: 'inherit'
        });
    }
} catch (err) {
    if (err.cmd && err.cmd === 'appsngen login') {
        console.log('You should login to appsngen.');
    } else {
        console.error(err.toString());
    }
    process.exit(1);
}

program
    .version('0.1.0')
    .command('create', 'creates widget', {isDefault: true})
    .command('build', 'builds widget sources')
    .command('run', 'runs widget locally')
    .command('preview', 'preview widget at AppsNgen')
    .command('deploy', 'deploys widget to AppsNgen')
    .command('list', 'print widgets list')
    .parse(process.argv);