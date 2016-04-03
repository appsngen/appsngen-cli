#! /usr/bin/env node

var Promise = require('bluebird').Promise;
var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');
var program = require('commander');
var jsonfile = require('jsonfile');

var validateWidgetName = function (name) {
    //TODO implement mechanism to check widget name via web call
    return Promise.resolve(!!name);
};
var registryPath = path.join(__dirname, '..', 'registry.json');
var widgetName, widgetPath;

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
try {
    if (fs.readdirSync(widgetPath).length !== 0) {
        throw 'Path already exists and is not empty: ' + path.resolve(widgetPath);
    }
} catch (e) {
    if (e.code !== 'ENOENT') {
        console.error(e.toString());
        process.exit(1);
    }
    fs.mkdirSync(widgetPath);
}
validateWidgetName(widgetName)
    .then(function () {
        jsonfile.readFile(registryPath, function (err, data) {
            if (err && err.code !== 'ENOENT') {
                throw err;
            }
            data = data || {};
            data[widgetName] = {
                path: path.resolve(widgetPath)
            };
            jsonfile.writeFileSync(registryPath, data, {
                spaces: 4
            });
        });
        //TODO implement mechanism to add widget to local storage
        execSync('yo appsngen-web-widget', {
            cwd: widgetPath,
            stdio: 'inherit'
        });
    })
    .catch(function (error) {
        console.error(error.toString());
        process.exit(1);
    });