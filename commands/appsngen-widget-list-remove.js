(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var registrycontroller = require('./../src/registrycontroller');
    var rmdir = require('rmdir');

    var widgetName, widgetsList;
    var removeRegistryRecord = function (name) {
        widgetsList[name] = undefined;
        registrycontroller.updateWidgetsList(widgetsList);
    };

    program
        .alias('appsngen widget list remove')
        .arguments('<name>')
        .usage('<name> [option]')
        .option('--hard', 'delete widget folder')
        .action(function (name) {
        widgetName = name;
    })
    .parse(process.argv);

    if (typeof widgetName === 'undefined') {
        program.help();
    }

    widgetsList = registrycontroller.getWidgetsList();
    if (widgetsList[widgetName]) {
        if (program.hard) {
            rmdir(widgetsList[widgetName].path, function (error) {
                if(error) {
                    console.error(error.toString());
                    process.exit(1);
                }
                removeRegistryRecord(widgetName);
            });
        } else {
            removeRegistryRecord(widgetName);
        }
    }
})();