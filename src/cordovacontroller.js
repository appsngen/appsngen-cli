(function () {
    'use strict';

    var path = require('path');
    var execSync = require('child_process').execSync;
    var jsonfile = require('jsonfile');
    var request = require('request');
    var fs = require('fs');
    var _ = require('underscore');
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');

    var SUPPORTED_PLATFORMS = ['browser', 'android', 'ios'];
    var rcFilePath = path.join(process.cwd(), '/.appsngenrc');
    var writeIntegrationFile = function (token, urn, serviceAddress) {
        var template, compiled;
        var viewerEndpoint = serviceAddress + '/viewer';
        var widgetURL = serviceAddress + '/viewer/content/widgets/' + urn + '/index.html?parent=file%3A%2F%2F&token=' +
                        encodeURIComponent(token);
        var widgetName = urn.split(':').pop();

        _.templateSettings= {
            interpolate: /\{\{(.+?)\}\}/g
        };
        try {
            template = fs.readFileSync(path.join(__dirname, './../templates/integration-template.txt'), 'utf8');
            compiled = _.template(template);
            fs.writeFileSync(path.join(process.cwd(), '/cordova/www/js/integration.js'), compiled({
                widgetURL: widgetURL,
                widgetUrn: urn,
                widgetName: widgetName,
                viewerEndpoint: viewerEndpoint
            }));
            console.log('Integration file updated.');
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };

    exports.create = function () {
        var packageConfig, rcConfig;
        try {
            packageConfig = jsonfile.readFileSync(path.join(process.cwd(),'/package.json'));
            execSync('npm run cordova create cordova io.cordova.helloappsngen ' + packageConfig.name +
            ' -- --template=' + path.resolve(path.join(__dirname, '/../templates/cordova-template')), {
                stdio: 'inherit'
            });
            rcConfig = jsonfile.readFileSync(rcFilePath);
            rcConfig.cordova = {
                platforms: []
            };
            jsonfile.writeFileSync(rcFilePath, rcConfig, {
                spaces: 4
            });
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };

    exports.addPlatform = function (platform) {
        var rcConfig;

        execSync('npm run cordova-manipulation platform add ' + platform, {
            stdio: 'inherit'
        });
        try {
            rcConfig = jsonfile.readFileSync(rcFilePath);
            rcConfig.cordova.platforms.push(platform);
            jsonfile.writeFileSync(rcFilePath, rcConfig, {
                spaces: 4
            });
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };

    exports.modify = function () {
        var rcConfig = jsonfile.readFileSync(rcFilePath);

        request.post(
            config.serviceAddress +  '/rest-services/tokens/access',
            {
                body: {
                    scope: {
                        widgets: [
                            rcConfig.urn
                        ]
                    },
                    domains: [
                        'file://',
                        'http://localhost:' + rcConfig.port
                    ]
                },
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + authcontroller.getIdentityToken()
                }
            },
            function (error, response) {
                if (error) {
                    console.error(error.toString());
                    throw error;
                } else {
                    console.log('Response recieved');
                    writeIntegrationFile(response.body.accessToken, rcConfig.urn, config.serviceAddress);
                }
            }
        );
    };

    exports.parsePlatforms = function (options) {
        var platforms = [];

        SUPPORTED_PLATFORMS.forEach(function (el) {
            if (options[el]) {
                platforms.push(el);
                options[el] = false;
            }
        });

        return platforms;
    };
})();