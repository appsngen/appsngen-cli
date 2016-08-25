(function () {
    'use strict';

    var Promise = require('bluebird').Promise;
    var path = require('path');
    var jsonfile = require('jsonfile');
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');
    var phonegapIntegration = require('appsngen-phonegap-integration');

    var LOCAL_SUPPORTED_PLATFORMS = [
        'browser',
        'android',
        'ios'
    ];
    var rcFilePath = path.join(process.cwd(), '.appsngenrc');

    exports.getArchivePath = function (root) {
        return path.join(root, 'dist', 'phonegapPackage.zip');
    };

    exports.create = function () {
        return new Promise(function (resolve, reject) {
            var packageConfig;

            try {
                packageConfig = jsonfile.readFileSync(path.join(process.cwd(), 'package.json'));
                phonegapIntegration.createPhonegapPackage(path.join('.', 'phonegap'), packageConfig.name,
                    function (error) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
            } catch (error) {
                reject(error);
            }
        });
    };

    exports.modify = function () {
        var rcConfig = jsonfile.readFileSync(rcFilePath);
        var options = {
            urn: rcConfig.urn,
            port: rcConfig.port,
            identityToken: authcontroller.getIdentityToken(),
            serviceAddress: config.serviceAddress,
            packagePath: path.join(process.cwd(), 'phonegap')
        };

        return new Promise(function (resolve, reject) {
            phonegapIntegration.setIntegration(options, function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    };

    exports.parsePlatforms = function (options) {
        var platforms = [];

        LOCAL_SUPPORTED_PLATFORMS.forEach(function (el) {
            if (options[el]) {
                platforms.push(el);
                options[el] = false;
            }
        });

        return platforms;
    };
})();
