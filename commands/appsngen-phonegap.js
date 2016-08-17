var program = require('./../src/customcommander');
var helper = require('./../src/clihelper');

helper.normalizePathToCurrentFile();
helper.addHelpForInvalidCommand(program);

program
    .alias('appsngen phonegap')
    .usage('[action]')
    .command('access [token]', 'gets access token for Build PhoneGap')
    .parse(process.argv);
