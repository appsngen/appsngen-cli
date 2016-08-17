#! /usr/bin/env node

// jscs: disable requireVarDeclFirst

var program = require('./../src/customcommander');
var helper = require('./../src/clihelper');
var packageInfo = require('./../package.json');

helper.addHelpForInvalidCommand(program);

program
    .version(packageInfo.version)
    .usage('[command]')
    .command('widget [action]', 'manipulates with appsngen widget')
    .command('phonegap [action]', 'gets access token for PhoneGap Build')
    .command('login', 'logins user to appsngen')
    .command('logout', 'logout user from appsngen')
    .parse(process.argv);
