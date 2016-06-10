(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var helper = require('./../src/clihelper');
    var fs = require('fs');
    var path = require('path');
    var request = require('request');
    var ProgressBar = require('progress');
    var phonegapIntegration = require('appsngen-phonegap-integration');

    var outputPath, platform, widgetName, widgetPhonegapId, phonegapCredentials,
        output, outputName, isSuccessfulDownload;

    program
        .arguments('[name] [platform]')
        .usage('[name] <platform>')
        .action(function (name, p) {
            if (!p) {
                platform = name;
            } else {
                widgetName = name;
                platform = p;
            }
        })
        .on('--help', function () {
            console.log('Supported platforms: \n\t' + phonegapIntegration.SUPPORTED_PLATFORMS.join('\n\t'));
        })
        .parse(process.argv);

    if (!platform) {
        console.log('Missing "platform" argument.');
        program.help();
    } else if (phonegapIntegration.SUPPORTED_PLATFORMS.indexOf(platform) === -1) {
        console.log('Not supported platform: "' + platform + '"\n' +
                    'Supported platforms: ' + phonegapIntegration.SUPPORTED_PLATFORMS.join(', ') +
                    '\nFor more information use "--help" option.');
        process.exit(1);
    }
    if (!widgetName) {
        widgetName = helper.getWidgetNameByPath('.');
    } else {
        helper.workByWidgetName(widgetName);
    }
    helper.checkPhonegapAuthorization(); // will terminate process if not authorized
    widgetPhonegapId = helper.getWidgetPhonegapId(widgetName); // will terminate process if doesn't have id
    phonegapCredentials = helper.getPhonegapCredentials();

    outputPath = path.join(process.cwd(), 'dist', 'temp');
    output = fs.createWriteStream(outputPath);
    output.on('finish', function () {
        if (isSuccessfulDownload) {
            outputName = outputName.substring(outputName.lastIndexOf('/') + 1);
            outputName = path.join(process.cwd(), 'dist', outputName);
            fs.renameSync(outputPath, outputName);
            console.log('Download complete successfully.\n' +
                'Application downloaded to: ' + outputName);
        } else {
            console.error('Download of application unavailable right now.');
            fs.unlinkSync(outputPath);
            process.exit(1);
        }
    });

    phonegapIntegration.getDownloadLink(widgetPhonegapId, platform, phonegapCredentials.access_token,
        function (error, location) {
            if (error) {
                console.error(error.toString());
                process.exit(1);
            }

            request(location)
                .on('response', function (response) {
                    var bar;
                    var dataLength = parseInt(response.headers['content-length'], 10);

                    if (response.statusCode === 404) {
                        isSuccessfulDownload = false;
                    } else {
                        isSuccessfulDownload = true;
                        outputName = response.request.path;

                        console.log();
                        bar = new ProgressBar('  downloading [:bar] :percent :etas', {
                            complete: '=',
                            incomplete: ' ',
                            width: 20,
                            total: dataLength
                        });
                        response.on('data', function (chunk) {
                            bar.tick(chunk.length);
                        });
                        response.on('end', function () {
                            console.log('\n');
                        });
                    }
                })
                .pipe(output);
        });
})();
