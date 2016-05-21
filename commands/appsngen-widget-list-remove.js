(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var registrycontroller = require('./../src/registrycontroller');
    var rmdir = require('rmdir');

    var widgetName, widgetsList;
    var removeRegistryRecord = function (name) {
        console.log('WARNING: widget package might remain at appsngen.com' +
            (widgetsList[name].phonegapId ? ' and build.phonegap.com.': '.'));
        widgetsList[name] = undefined;
        registrycontroller.updateWidgetsList(widgetsList);
    };

    program
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
    } else {
        console.log('Widget with provided name doesn\'t exist.');
        process.exit(1);
    }
})();