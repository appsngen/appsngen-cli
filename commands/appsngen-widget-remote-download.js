(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var helper = require('./../src/clihelper');
    var cordovacontroller = require('./../src/cordovacontroller');
    var fs = require('fs');
    var path = require('path');
    var request = require('request');

    var outputPath, platform, widgetName, widgetPhonegapId, phonegapCredentials,
        output, outputName, isSuccessfulDownload;

    program
        .arguments('[name] [platform]')
        .usage('[name] <platform>')
        .action(function (name, p) {
            if (!p) {
                platform = name;
                widgetName = helper.getWidgetNameByPath('.');
            } else {
                widgetName = name;
                platform = p;
                helper.workByWidgetName(widgetName);
            }
        })
        .on('--help', function () {
            console.log('Supported platforms: \n\t' + cordovacontroller.REMOTE_SUPPORTED_PLATFORMS.join('\n\t'));
        })
        .parse(process.argv);

    if (!platform) {
        console.log('Missing "platform" argument.');
        program.help();
    } else if (cordovacontroller.REMOTE_SUPPORTED_PLATFORMS.indexOf(platform) === -1) {
        console.log('Not supported platform: "' + platform + '"\n' +
                    'Supported platforms: ' + cordovacontroller.REMOTE_SUPPORTED_PLATFORMS.join(', ') +
                    '\nFor more information use "--help" option.');
        process.exit(1);
    }
    helper.checkPhonegapAuthorization(); //will terminate process if not authorized
    widgetPhonegapId = helper.getWidgetPhonegapId(widgetName); //will terminate process if doesn't have id
    phonegapCredentials = helper.getPhonegapCredentials();

    outputPath = path.join(process.cwd(), 'dist', 'temp');
    output = fs.createWriteStream(outputPath);
    output.on('finish', function () {
        if (isSuccessfulDownload) {
            outputName = outputName.substring(outputName.lastIndexOf('/') + 1);
            fs.renameSync(outputPath, path.join(process.cwd(), 'dist', outputName));
            console.log('Download complete successfully.');
        } else {
            console.error('Download of application unavailable right now.');
            fs.unlinkSync(outputPath);
            process.exit(1);
        }
    });

    request('https://build.phonegap.com/api/v1/apps/' + widgetPhonegapId +
            '/' + platform +'?access_token=' + phonegapCredentials.access_token)
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