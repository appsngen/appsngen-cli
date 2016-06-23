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
        var elapsedTime = 0;
        var indicatorSymbolInd = 0;
        var statusCheckInterval = 6000; // ms
        var animationInterval = 100; // ms
        var waitSymbols = [
            '-',
            '\\',
            '|',
            '/'
        ];

        if (platforms === 'all') {
            platforms = phonegapIntegration.SUPPORTED_PLATFORMS;
        } else {
            platforms = [platforms];
        }

        indicatorId = setInterval(function () {
            process.stdout.write('\b\r' + waitSymbols[indicatorSymbolInd++ % 4]);
            elapsedTime += animationInterval;

            if (elapsedTime >= statusCheckInterval) {
                request(url, function (error, response) {
                    var body, isEveryPlatformBuilded;

                    if (error) {
                        console.error(error.toString());
                        process.exit(1);
                    }

                    body = JSON.parse(response.body);
                    isEveryPlatformBuilded = platforms.every(function (platform) {
                        return body.status[platform] !== 'pending';
                    });
                    if (isEveryPlatformBuilded) {
                        clearInterval(indicatorId);
                        console.log('\rBuild finished.');
                        console.log('Check status at: ' + statusUrl);
                    }
                });
                elapsedTime = 0;
            }
        }, animationInterval);
    };
    var startBuild = function () {
        var platform = 'all';
        var checkUrl = 'https://build.phonegap.com/api/v1/apps/' + widgetPhonegapId;
        var statusUrl = 'https://build.phonegap.com/apps/' + widgetPhonegapId;

        if (program.platform) {
            if (phonegapIntegration.SUPPORTED_PLATFORMS.indexOf(program.platform) !== -1) {
                platform = program.platform;
            } else {
                console.error('Unsupported platform: ' + program.platform);
                process.exit(1);
            }
        }
        checkUrl += '?access_token=' + phonegapAccessToken;

        phonegapIntegration.buildPhonegapApp(widgetPhonegapId, platform, phonegapAccessToken,
            function (error) {
                if (error) {
                    console.error(error.toString());
                    process.exit(1);
                }

                checkBuildStatus(checkUrl, statusUrl, platform);
            });
    };
    var updateCallback = function (error) {
        fs.unlink(archivePath);
        if (error) {
            console.error(error.toString());
            process.exit(1);
        }

        startBuild();
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
    helper.checkPhonegapAuthorization(); // will terminate process if not authorized

    phonegapAccessToken = helper.getPhonegapCredentials().access_token;

    if (typeof widgetName === 'undefined') {
        widgetName = helper.getWidgetNameByPath(process.cwd());
    }
    widgetPhonegapId = helper.getWidgetPhonegapId(widgetName); // will terminate process if doesn't have id
    archivePath = phonegapcontroller.getArchivePath(process.cwd());

    if (!program.noupload) {
        phonegapIntegration.generatePhonegapZipPackage(path.join('.', 'phonegap'), archivePath, function (error) {
            if (error) {
                console.error(error.toString());
                process.exit(1);
            }

            phonegapIntegration.updatePhonegapApp(widgetPhonegapId, phonegapAccessToken,
                archivePath, updateCallback);
        });
    } else {
        startBuild();
    }
})();
