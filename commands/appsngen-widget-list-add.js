(function () {
    'use strict';

    var program = require('commander');
    var jsonfile = require('jsonfile');
    var bluebird = require('bluebird');
    var Promise = bluebird.Promise;
    var helper = require('./../src/clihelper');
    var path = require('path');

    var widgetName, widgetPath, registry;
    var registryPath = path.join(__dirname, '..', 'registry.json');

    program
    .arguments('<name> <path>')
    .action(function (name, path) {
        widgetName = name;
        widgetPath = path;
    })
    .parse(process.argv);

    if (!widgetName || !widgetPath) {
        console.error('You should provide widget name and path to widget folder');
        process.exit(1);
    }

    helper.validateWidgetName(widgetName)
    .then(function () {
        if (helper.isProjectFolder(widgetPath)) {
            return Promise.resolve();
        }
    })
    .then(function () {
        try {
            registry = jsonfile.readFileSync(registryPath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
        registry = registry || {};
        if (registry[widgetName]) {
            throw 'Widget with this name already exist.';
        }
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
})();