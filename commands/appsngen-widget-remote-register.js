(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var helper = require('./../src/clihelper');
    var registrycontroller = require('./../src/registrycontroller');
    var phonegapcontroller = require('./../src/phonegapcontroller');
    var fs = require('fs');
    var phonegapIntegration = require('appsngen-phonegap-integration');
    var path = require('path');

    var keys = {};
    var widgetName, archivePath, phonegapCredentials;

    program
        .arguments('[name]')
        .option('--key-ios <keyId>', 'signing key id for ios')
        .option('--key-android <keyId>', 'signing key id for android')
        .action(function (name) {
            widgetName = name;
        })
        .parse(process.argv);

    helper.workByWidgetName(widgetName);
    if (!widgetName) {
        widgetName = helper.getWidgetNameByPath(process.cwd());
    }

    helper.checkPhonegapAuthorization(); // will terminate process if not authorized
    phonegapCredentials = helper.getPhonegapCredentials();

    ['keyIos', 'keyAndroid'].forEach(function (el) {
        if (program[el]) {
            keys[el.substring(3).toLowerCase()] = {
                id: program[el]
            };
        }
    });

    archivePath = phonegapcontroller.getArchivePath(process.cwd());
    phonegapIntegration.generatePhonegapZipPackage(path.join('.', 'phonegap'), archivePath, function () {
        phonegapIntegration.registerPhonegapApp(phonegapCredentials.access_token, archivePath, keys,
            function (error, info) {
                var widgetsList;

                fs.unlinkSync(archivePath);
                if (error) {
                    console.error(error.toString());
                    process.exit(1);
                }

                widgetsList = registrycontroller.getWidgetsList();
                widgetsList[widgetName].phonegapId = info.id;
                registrycontroller.updateWidgetsList(widgetsList);
                console.log('Upload success.\n' + 'id: ' + info.id + ' title: ' + info.title);
            });
    });
})();
