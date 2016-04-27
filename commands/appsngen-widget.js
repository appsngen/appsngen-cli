#! /usr/bin/env node

var program = require('./../src/customcommander');
var path = require('path');
var jsonfile = require('jsonfile');
var helper = require('./../src/clihelper');

var ADDRESSABLE_COMMANDS = [
    'build',
    'run',
    'preview',
    'deploy'
];
var registry, widgetName, callWithName;

helper.checkAppsngenAuthorization(); //will terminate process in case of authorization fail

try {
    if (ADDRESSABLE_COMMANDS.indexOf(process.argv[2]) !== -1) {
        callWithName = process.argv.length >= 4 &&
            process.argv[3].indexOf('-') !== 0; //check 4th argument isn't option
        if (callWithName) {
            widgetName = process.argv[3];
            registry = jsonfile.readFileSync(path.join(__dirname, '..', 'registry.json'));
            if (registry[widgetName]) {
                process.chdir(registry[widgetName].path);
            } else {
                throw 'Widget "' + widgetName + '"doesn\'t exist';
            }
        } else {
            if (!helper.isProjectFolder('.')) {
                throw 'Current folder isn\'t appsngen widget project.';
            }
        }
    }
} catch (err) {
    console.error(err.toString());
    process.exit(1);
}

helper.normalizePathToCurrentFile();

program
    .usage('[command]')
    .command('create', 'creates widget')
    .command('build', 'builds widget sources')
    .command('run', 'runs widget locally')
    .command('preview', 'preview widget at AppsNgen')
    .command('deploy', 'deploys widget to AppsNgen')
    .command('list', 'print widgets list')
    .parse(process.argv);