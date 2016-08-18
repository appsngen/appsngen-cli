(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var helper = require('./../src/clihelper');
    var registrycontroller = require('./../src/registrycontroller');
    var phonegapcontroller = require('./../src/phonegapcontroller');
    var fs = require('fs');
    var Promise = require('bluebird').Promise;
    var phonegapIntegration = require('appsngen-phonegap-integration');
    var path = require('path');
    var generatePhonegapZipPackage = Promise.promisify(phonegapIntegration.generatePhonegapZipPackage);
    var registerPhonegapApp = Promise.promisify(phonegapIntegration.registerPhonegapApp);

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

    console.log('Generating archive for registration.');
    helper.startLoadingIndicator();
    generatePhonegapZipPackage(path.join('.', 'phonegap'), archivePath)
        .then(function () {
            console.log('Generation completed successfully.');
            console.log('Registring application to PhoneGap.');
            return registerPhonegapApp('temp', phonegapCredentials.access_token, archivePath, keys);
        }, function () {
            console.error('\b\rUnable to generate archive for registration.');
            return Promise.reject();
        })
        .then(function (info) {
            var widgetsList = registrycontroller.getWidgetsList();

            widgetsList[widgetName].phonegapId = info.id;
            registrycontroller.updateWidgetsList(widgetsList);
            helper.stopLoadingIndicator();
            console.log('Registration completed successfully.\n' + 'id: ' + info.id + ' title: ' + info.title);
        }, function (reason) {
            console.error('\b\rUnable to register widget at PhoneGap.');
            console.error('\nError:', reason.message);
            return Promise.reject();
        })
        .catch(function () {
            console.error('\n Operation aborted.');
            process.exit(1);
        })
        .finally(function () {
            fs.unlinkSync(archivePath);
        });
})();
