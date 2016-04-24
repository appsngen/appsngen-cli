(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var Promise = require('bluebird').Promise;
    var helper = require('./../src/clihelper');
    var registrycontroller = require('./../src/registrycontroller');
    var path = require('path');

    var widgetName, widgetPath;

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

    //helper.validateWidgetName(widgetName)
    Promise.resolve()
    .then(function () {
        if (helper.isProjectFolder(widgetPath)) {
            return Promise.resolve();
        } else {
            return Promise.reject('Provided path isn\'t appsngen widget project.');
        }
    })
    .then(function () {
        registrycontroller.addWidget(widgetName, path.resolve(widgetPath));
    })
    .catch(function (err) {
        console.error(err.toString());
        process.exit(1);
    });
})();