var program = require('./../src/customcommander');
var helper = require('./../src/clihelper');

var ADDRESSABLE_COMMANDS = [
    'build',
    'preview',
    'deploy'
];
var callWithName;

helper.addHelpForInvalidCommand(program);
helper.checkAppsngenAuthorization(); // will terminate process in case of authorization fail

try {
    if (ADDRESSABLE_COMMANDS.indexOf(process.argv[2]) !== -1) {
        callWithName = process.argv.length >= 4 &&
            process.argv[3].indexOf('-') !== 0; // check 4th argument isn't option
        if (callWithName) {
            helper.workByWidgetName(process.argv[3]);
        } else if (!helper.isProjectFolder('.')) {
            throw 'Current folder isn\'t appsngen widget project.';
        }
    }
} catch (error) {
    console.error(error.toString());
    process.exit(1);
}

helper.normalizePathToCurrentFile();

program
    .usage('[command]')
    .command('create', 'creates widget')
    .command('build', 'builds widget sources')
    .command('preview', 'preview widget at AppsNgen')
    .command('deploy', 'deploys widget to AppsNgen')
    .command('list', 'print widgets list')
    .parse(process.argv);
