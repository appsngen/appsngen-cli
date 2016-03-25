#! /usr/bin/env node

console.log('code to process widget related commands');

var program = require('commander');
var path = require('path');

normalizePathToCurrentFile();

program
    .version('0.1.0')
    .command('create', 'creates widget using generator', {isDefault: true})
    .command('build', 'builds widget sources')
    .command('run', 'runs widget locally')
    .command('preview', 'preview widget at AppsNgen')
    .command('deploy', 'deploys widget to AppsNgen')
    .command('compile', 'compiles widget for target platform')
    .parse(process.argv);

//add file extension to current file in this extension not exists
function normalizePathToCurrentFile() {
    var currentFile = process.argv[1];
    if (path.extname(currentFile) != '.js') {
        currentFile += '.js';
    }
    process.argv[1] = currentFile;
}