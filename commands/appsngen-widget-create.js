#! /usr/bin/env node

'use strict';

var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var program = require('./../src/customcommander');
var helper = require('./../src/clihelper');
var registrycontroller = require('./../src/registrycontroller');
var Promise = require('bluebird').Promise;

var widgetName, widgetPath;

program
    .alias('appsngen widget create')
    .usage('<name> [path]')
    .arguments('<name> [path]')
    .action(function (name, path) {
        widgetName = name;
        widgetPath = path;
    })
    .parse(process.argv);

if (typeof widgetName === 'undefined') {
    console.error('No widget name provided');
    process.exit(1);
}
if (typeof widgetPath !== 'undefined') {
    widgetPath = path.resolve(widgetPath);
} else {
    widgetPath = path.join(process.cwd(), widgetName);
}

new Promise(function (resolve) {
    try {
        if (fs.readdirSync(widgetPath).length !== 0) {
            throw 'Path already exists and is not empty: ' + path.resolve(widgetPath);
        }
        return resolve();
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }})
    .then(function () {
        return helper.validateWidgetName(widgetName);
    })
    .then(function () {
        console.log('Chech system configuration.');
        helper.checkSystemConfiguration();
        console.log('Check completed successfully.');
        return Promise.resolve();
    })
    .then(function () {
        mkdirp.sync(widgetPath);
        execSync('npm run yo appsngen-web-widget "' + path.resolve(widgetPath) + '" "' + widgetName + '"', {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        registrycontroller.addWidget(widgetName, widgetPath);
    })
    .catch(function (error) {
        console.error(error.toString());
        process.exit(1);
    });