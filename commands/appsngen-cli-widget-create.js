#! /usr/bin/env node

var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var program = require('./../src/customcommander');
var jsonfile = require('jsonfile');
var helper = require('./../src/clihelper');

var registryPath = path.join(__dirname, '..', 'registry.json');
var widgetName, widgetPath, registry;

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
    widgetPath = path.join(widgetPath, widgetName);
} else {
    widgetPath = path.join('.', widgetName);
}
helper.validateWidgetName(widgetName)
    .then(function () {
        try {
            if (fs.readdirSync(widgetPath).length !== 0) {
                throw 'Path already exists and is not empty: ' + path.resolve(widgetPath);
            }
        } catch (e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
        }
        try {
            registry = jsonfile.readFileSync(registryPath);
        } catch (e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
        }
        registry = registry || {};
        if (registry[widgetName]) {
            throw 'Widget with this name already exist.';
        }
        mkdirp.sync(widgetPath);
        execSync('npm run yo appsngen-web-widget ' + path.resolve(widgetPath), {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        registry[widgetName] = {
            path: path.resolve(widgetPath)
        };
        jsonfile.writeFileSync(registryPath, registry, {
            spaces: 4
        });
    })
    .catch(function (error) {
        console.error(error.toString());
        process.exit(1);
    });