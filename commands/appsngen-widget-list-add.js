(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var helper = require('./../src/clihelper');
    var registrycontroller = require('./../src/registrycontroller');
    var path = require('path');

    var widgetName, widgetPath, widgetsList;

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

    widgetsList = registrycontroller.getWidgetsList();
    try {
        if (!widgetsList[widgetName]) {
            if (!helper.isProjectFolder(widgetPath)) {
                throw 'Provided path isn\'t appsngen widget project.';
            }
            registrycontroller.addWidget(widgetName, path.resolve(widgetPath));
        } else {
           throw 'Widget with same name already exists.';
        }
    } catch (error) {
        console.error(error.toString());
        process.exit(1);
    }
})();