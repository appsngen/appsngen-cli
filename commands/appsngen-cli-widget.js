#! /usr/bin/env node

var program = require('commander');
var path = require('path');
var authcontroller = require('./../src/authcontroller');
var execSync = require('child_process').execSync;

normalizePathToCurrentFile();

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
    .command('compile', 'compiles widget for target platform')
    .parse(process.argv);

//add file extension to current file in this extension not exists
function normalizePathToCurrentFile() {
    var currentFile = process.argv[1];
    if (path.extname(currentFile) !== '.js') {
        currentFile += '.js';
    }
    process.argv[1] = currentFile;
}