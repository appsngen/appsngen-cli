(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var fs = require('fs');
    var cordovacontroller = require('./../src/cordovacontroller');
    var helper = require('./../src/clihelper');
    var request = require('request');

    var archive, archivePath, widgetName, phonegapAccessToken, widgetPhonegapId;
    var startBuild = function () {
        var url = 'https://build.phonegap.com/api/v1/apps/' + widgetPhonegapId + '/build';
        if (program.platform && cordovacontroller.REMOTE_SUPPORTED_PLATFORMS.indexOf(program.platform) !== -1) {
            url += '/' + program.platform;
        } else {
            console.error('Unsupported platform: ' + program.platform);
            process.exit(1);
        }
        url += '?access_token=' + phonegapAccessToken;

        request.post(url, function (error, resp) {
            if (error) {
                console.error(error.toString());
                process.exit(1);
            }

            if (resp.statusCode === 202) {
                console.log('Build successfully started.');
            } else {
                console.log('Unable to start build.');
                process.exit(1);
            }
        });
    };
    var updateCallback = function (error, resp) {
        var body;

        fs.unlink(cordovacontroller.getArchivePath(process.cwd()));
        if (error) {
            console.error(error.toString());
            process.exit(1);
        }

        body = JSON.parse(resp.body);
        switch (resp.statusCode) {
            case 200:
                startBuild();
                break;
            case 401:
                console.log('Invalid PhoneGap Id');
                process.exit(1);
                break;
            case 404:
                console.log(body.error);
                process.exit(1);
                break;
            default:
                console.log('Unknown error from build.phonegap.com');
                process.exit(1);
                break;
        }
    };

    program
        .arguments('[name]')
        .option('--platform <platform>', 'Start build for specific platform')
        .option('--noupload', 'Start build without upload')
        .action(function (name) {
            widgetName = name;
        })
        .parse(process.argv);

    helper.workByWidgetName(widgetName);
    helper.checkPhonegapAuthorization(); //will terminate process if not authorized

    phonegapAccessToken = helper.getPhonegapCredentials().access_token;
    
    if (typeof widgetName === 'undefined') {
        widgetName = helper.getWidgetNameByPath(process.cwd());
    }
    widgetPhonegapId = helper.getWidgetPhonegapId(widgetName); //will terminate process if doesn't have id
    archivePath = cordovacontroller.getArchivePath(process.cwd());

    if (!program.noupload) {
        archive = fs.createWriteStream(archivePath);
        archive.on('close', function () {
            request.put('https://build.phonegap.com/api/v1/apps/' + widgetPhonegapId +
                    '?access_token=' + phonegapAccessToken, updateCallback)
                .form()
                .append('file', fs.createReadStream(archivePath));
        });
        cordovacontroller.createArchive(archive);
    } else {
        startBuild();
    }
})();