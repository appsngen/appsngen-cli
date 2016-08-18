(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var fs = require('fs');
    var phonegapcontroller = require('./../src/phonegapcontroller');
    var helper = require('./../src/clihelper');
    var request = require('request');
    var phonegapIntegration = require('appsngen-phonegap-integration');
    var path = require('path');

    var archivePath, widgetName, phonegapAccessToken, widgetPhonegapId;

    var checkBuildStatus = function (url, statusUrl, platforms) {
        var indicatorId;
        var statusCheckInterval = 6000; // ms

        if (platforms === 'all') {
            platforms = phonegapIntegration.SUPPORTED_PLATFORMS;
        } else {
            platforms = [platforms];
        }

        indicatorId = setInterval(function () {
            request(url, function (error, response) {
                var body, isEveryPlatformBuilded;

                if (error) {
                    console.error('\b\rError: unable to check build status.');
                    process.exit(1);
                }

                body = JSON.parse(response.body);
                isEveryPlatformBuilded = platforms.every(function (platform) {
                    return body.status[platform] !== 'pending';
                });
                if (isEveryPlatformBuilded) {
                    clearInterval(indicatorId);
                    helper.stopLoadingIndicator();
                    console.log('\rBuild completed successfully.');
                    console.log('Check status at: ' + statusUrl);
                }
            });
        }, statusCheckInterval);
    };
    var startBuild = function () {
        var platform = 'all';
        var checkUrl = 'https://build.phonegap.com/api/v1/apps/' + widgetPhonegapId;
        var statusUrl = 'https://build.phonegap.com/apps/' + widgetPhonegapId;

        if (program.platform) {
            platform = program.platform;
        }
        checkUrl += '?access_token=' + phonegapAccessToken;

        console.log('\b\rStarting build at PhoneGap.');
        phonegapIntegration.buildPhonegapApp(widgetPhonegapId, platform, phonegapAccessToken,
            function (error) {
                if (error) {
                    console.error('\b\rError: unable to start build application at PhoneGap.');
                    process.exit(1);
                }

                console.log('\b\rBuild successfully started.');
                checkBuildStatus(checkUrl, statusUrl, platform);
            });
    };
    var updateCallback = function (error) {
        fs.unlink(archivePath);
        if (error) {
            console.error('\b\rError: unable to update application at PhoneGap.');
            process.exit(1);
        }
        console.log('\b\rUpdate completed successfully.');
        startBuild();
    };

    program
        .arguments('[name]')
        .option('--platform <platform>', 'Start build for specific platform')
        .option('--noupload', 'Start build without upload')
        .action(function (name) {
            widgetName = name;
        })
        .on('--help', function () {
            console.log('Supported platforms: \n\t' + phonegapIntegration.SUPPORTED_PLATFORMS.join('\n\t'));
        })
        .parse(process.argv);

    if (program.platform && phonegapIntegration.SUPPORTED_PLATFORMS.indexOf(program.platform) === -1) {
        console.error('\b\rUnsupported platform: ' + program.platform);
        program.help(); // call process.exit after printing help
    }

    helper.workByWidgetName(widgetName);
    helper.checkPhonegapAuthorization(); // will terminate process if not authorized

    phonegapAccessToken = helper.getPhonegapCredentials().access_token;

    if (typeof widgetName === 'undefined') {
        widgetName = helper.getWidgetNameByPath(process.cwd());
    }
    widgetPhonegapId = helper.getWidgetPhonegapId(widgetName); // will terminate process if doesn't have id
    archivePath = phonegapcontroller.getArchivePath(process.cwd());

    helper.startLoadingIndicator();
    if (!program.noupload) {
        console.log('\b\rStart generating archive.');
        phonegapIntegration.generatePhonegapZipPackage(path.join('.', 'phonegap'), archivePath, function (error) {
            var updateOptions;

            if (error) {
                console.error('\b\rError: unable to generate archive for updating application.');
                process.exit(1);
            }

            updateOptions = {
                applicationId: widgetPhonegapId,
                accessToken: phonegapAccessToken,
                packagePath: archivePath,
                keysObject: null
            };
            console.log('\b\rGeneration completed successfully.');
            console.log('\b\rUpdating application at PhoneGap.');
            phonegapIntegration.updatePhonegapApp(updateOptions, updateCallback);
        });
    } else {
        startBuild();
    }
})();
