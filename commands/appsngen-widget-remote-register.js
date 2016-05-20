(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var helper =  require('./../src/clihelper');
    var registrycontroller = require('./../src/registrycontroller');
    var cordovacontroller = require('./../src/cordovacontroller');
    var fs = require('fs');
    var request = require('request');

    var keys = {};
    var widgetName, archivePath, output, phonegapCredentials;

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

    helper.checkPhonegapAuthorization(); //will terminate process if not authorized
    phonegapCredentials = helper.getPhonegapCredentials();

    ['keyIos', 'keyAndroid'].forEach(function (el) {
        if (program[el]) {
            keys[el.substring(3).toLowerCase()] = {
                id: program[el]
            };
        }
    });

    archivePath = cordovacontroller.getArchivePath(process.cwd());
    output = fs.createWriteStream(archivePath);
    output.on('close', function () {
        var req, form;

        req = request.post('https://build.phonegap.com/api/v1/apps?access_token=' +
            phonegapCredentials.access_token, function (error, resp) {
            var body, widgetsList;

            fs.unlinkSync(archivePath);
            if (error) {
                console.error(error.toString());
                process.exit(1);
            }

            body = JSON.parse(resp.body);
            if (resp.statusCode === 201) {
                widgetsList = registrycontroller.getWidgetsList();
                widgetsList[widgetName].phonegapId = body.id;
                registrycontroller.updateWidgetsList(widgetsList);
                console.log('Upload success.\n' +
                    'id: ' + body.id + ' title: ' + body.title);
            } else {
                console.error(body.error);
                process.exit(1);
            }
        });
        form = req.form();
        form.append('data', JSON.stringify({
            title: 'temp', //required field, PhoneGap Build replace it with title from config.xml
            create_method: 'file',
            keys: keys
        }));
        form.append('file', fs.createReadStream(archivePath));
    });
    cordovacontroller.createArchive(output);
})();