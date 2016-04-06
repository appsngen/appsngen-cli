var program = require('commander');
var path = require('path');
var helper = require('./../src/clihelper');

helper.normalizePathToCurrentFile();

program
    .command('list', 'print widgets list', {isDefault: true})
    .command('add', 'add widget to widgets list')
    .command('remove', 'remove widget from widgets list')
    .parse(process.argv);