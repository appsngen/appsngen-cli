#! /usr/bin/env node

var Promise = require('bluebird').Promise;
var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var program = require('commander');
var jsonfile = require('jsonfile');

var validateWidgetName = function (name) {
    //TODO implement mechanism to check widget name via web call
    return Promise.resolve(!!name);
};
var registryPath = path.join(__dirname, '..', 'registry.json');
var widgetName, widgetPath, registry;

program
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
validateWidgetName(widgetName)
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
        execSync('yo appsngen-web-widget', {
            cwd: widgetPath,
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