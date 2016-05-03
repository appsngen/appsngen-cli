#! /usr/bin/env node

var program = require('./../src/customcommander');

program
    .version('0.1.0')
    .usage('[command]')
    .command('widget [action]', 'manipulates with appsngen widget')
    .command('phonegap [action]', 'gets access token for PhoneGap Build')
    .command('login', 'logins user to appsngen')
    .command('logout', 'logout user from appsngen')
    .parse(process.argv);