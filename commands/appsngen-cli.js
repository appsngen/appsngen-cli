#! /usr/bin/env node --harmony

var program = require('commander');

program
    .version('0.1.0')
    .command('widget [action]', 'manipulates with appsngen widget')
    .command('login', 'logins user to appsngen')
    .parse(process.argv);