var program = require('./../src/customcommander');
var helper = require('./../src/clihelper');

helper.normalizePathToCurrentFile();

program
    .usage('[command]')
    .command('register', 'Create a new app on PhoneGap Build')
    .command('build', 'Build app in PhoneGap Build')
    .command('download', 'Download app for specified platform')
    .parse(process.argv);