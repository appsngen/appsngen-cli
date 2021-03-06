var program = require('./../src/customcommander');
var helper = require('./../src/clihelper');

helper.normalizePathToCurrentFile();
helper.addHelpForInvalidCommand(program);

program
    .usage('[command]')
    .command('list', 'print widgets list', {isDefault: true})
    .command('add', 'add widget to widgets list')
    .command('remove', 'remove widget from widgets list')
    .parse(process.argv);
