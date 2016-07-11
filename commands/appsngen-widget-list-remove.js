(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var registrycontroller = require('./../src/registrycontroller');
    var remove = require('fs-extra').remove;
    var readlineSync = require('readline-sync');

    var widgetName;
    var widgetsList;
    var removeRegistryRecord = function (name) {
        console.log('WARNING: widget package might remain at appsngen.com' +
            (widgetsList[name].phonegapId ? ' and build.phonegap.com.': '.'));
        widgetsList[name] = undefined;
        registrycontroller.updateWidgetsList(widgetsList);
        console.log('Widget "'+ name +'" was successfully deleted.');
    };
    var removeWidgetHard = function (name) {
        remove(widgetsList[name].path, function (error) {
            if (error) {
                console.log(error.toString());
                process.exit(1);
            }

            removeRegistryRecord(name);
        });
    };
    var getConfirmation  = function () {
        var confirmation;

        confirmation = readlineSync.keyInYNStrict('Are you sure?');
        if (!confirmation) {
            console.log('Operation aborted');
            process.exit(0);
        }
    };

    program
        .arguments('<name>')
        .usage('[name] [option]')
        .option('--hard', 'delete widget folder')
        .option('--clear-all', 'delete all widgets with their folders')
        .action(function (name) {
            widgetName = name;
        })
        .parse(process.argv);

    widgetsList = registrycontroller.getWidgetsList();
    if (!program.clearAll) {
        if (typeof widgetName === 'undefined') {
            program.help();
        }

        if (!widgetsList[widgetName]) {
            console.log('Widget with provided name doesn\'t exist.');
            process.exit(1);
        }
    }


    if (program.hard) {
        getConfirmation(); // will terminate the process if get no as an answer
        removeWidgetHard(widgetName);
    } else if (program.clearAll) {
        getConfirmation(); // will terminate the process if get no as an answer
        for (widgetName in widgetsList) {
            removeWidgetHard(widgetName);
        }
    } else {
        removeRegistryRecord(widgetName);
    }
})();
