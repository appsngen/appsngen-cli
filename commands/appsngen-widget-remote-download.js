(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var helper = require('./../src/clihelper');
    var registrycontroller = require('./../src/registrycontroller');
    var fs = require('fs');
    var path = require('path');
    var request = require('request');

    var SUPPORTED_PLATFORMS = [
        'android',
        'ios'
    ];
    var outputPath, platform, widgetName, widgetPhonegapId, phonegapCredentials,
        output, outputName, isSuccessfulDownload;

    program
        .arguments('[name] [platform]')
        .usage('[name] <platform>')
        .action(function (name, p) {
            if (!p) {
                platform = name;
                widgetName = helper.getWidgetNameByPath(path.resolve(process.cwd()));
            } else {
                widgetName = name;
                platform = p;
                helper.workByWidgetName(widgetName);
            }
        })
        .on('--help', function () {
            console.log('Supported platforms: \n\t' + SUPPORTED_PLATFORMS.join('\n\t'));
        })
        .parse(process.argv);

    phonegapCredentials = helper.getPhonegapCredentials();
    widgetPhonegapId = registrycontroller.getWidgetsList()[widgetName].phonegap_id;

    if (!platform || SUPPORTED_PLATFORMS.indexOf(platform) === -1) {
        console.log('Missing "platform" argument.');
        program.help();
    }
    helper.isPhonegapAuthorized(); //will terminate process if not authorized
    if (!widgetPhonegapId) {
        console.log('Widget "' + widgetName + '" doesn\'t have PhoneGap Id.');
        console.log('Use "appsngen widget remote register" command to resolve this issue.');
        process.exit(1);
    }

    outputPath = path.join(process.cwd(), 'dist', 'temp');
    output = fs.createWriteStream(outputPath);
    output.on('close', function () {
        if (isSuccessfulDownload) {
            outputName = outputName.substring(outputName.lastIndexOf('/.') + 2);
            fs.renameSync(outputPath, path.join(process.cwd(), 'dist', outputName));
        } else {
            console.error('No application with PhoneGap ID: ' + widgetPhonegapId);
            fs.unlinkSync(outputPath);
            process.exit(1);
        }
    });

    request('https://build.phonegap.com/api/v1/apps/2038944/android?access_token=' + phonegapCredentials.access_token)
        .on('response', function (response) {
            if (response.statusCode === 404) {
                isSuccessfulDownload = false;
            } else {
                isSuccessfulDownload = true;
                outputName = response.request.path;
            }
        })
        .pipe(output);
})();