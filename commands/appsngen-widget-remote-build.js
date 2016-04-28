(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var fs = require('fs');
    var cordovacontroller = require('./../src/cordovacontroller');
    var registrycontroller = require('./../src/registrycontroller');
    var helper = require('./../src/clihelper');
    var request = require('request');

    var archive, widgetName, phonegapCredentials, widgetsList;

    program
        .arguments('[name]')
        .option('--ios', 'Start build for IOS platform')
        .option('--android', 'Start build for android platform')
        .action(function (name) {
            widgetName = name;
        })
        .parse(process.argv);

    helper.workByWidgetName(widgetName);
    helper.checkPhonegapAuthorization(); //will terminate process if not authorized

    phonegapCredentials = helper.getPhonegapCredentials();
    
    if (typeof widgetName === 'undefined') {
        widgetName = helper.getWidgetNameByPath('.');
    }
    widgetsList = registrycontroller.getWidgetsList();
    
    archive = fs.createWriteStream(cordovacontroller.archivePath);
    archive.on('close', function () {
        var req;

        req = request.put('https://build.phonegap.com/api/v1/apps/' + widgetsList[widgetName].phonegap_id +
                '?access_token=' + phonegapCredentials.access_token, function (err, resp) {
            if (err) {
                console.error(err.toString());
                process.exit(1);
            }

            console.log('STATUS: ' + resp.statusCode + ' BODY: ' + resp.body);
        });
        req.form().append('file', fs.createReadStream(cordovacontroller.archivePath));
    });
    cordovacontroller.createArchive(archive);
})();