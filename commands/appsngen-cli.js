#! /usr/bin/env node --harmony

var program = require('./../src/customcommander');

program
    .version('0.1.0')
    .alias('appsngen')
    .usage('[command]')
    .command('widget [action]', 'manipulates with appsngen widget')
    .command('login', 'logins user to appsngen')
    .command('logout', 'logout user from appsngen')
    .parse(process.argv);