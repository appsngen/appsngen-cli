#! /usr/bin/env node

var program = require('commander');

program
    .version('0.1.0')
    .command('widget [action]', 'manipulates with appsngen widget 12')
    .command('login [query]', 'logins user to appsngen')
    .parse(process.argv);