(function () {
    'use strict';

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
    var rcFilePath = path.join(process.cwd(), '/.appsngenrc');

    exports.getArchivePath = function (root) {
        return path.join(root, 'dist', 'phonegapPackage.zip');
    };

    exports.create = function () {
        var packageConfig, rcConfig;

        try {
            packageConfig = jsonfile.readFileSync(path.join(process.cwd(), '/package.json'));
            phonegapIntegration.createPhonegapPackage(path.join('.', 'phonegap'), packageConfig.name);
            rcConfig = jsonfile.readFileSync(rcFilePath);
            rcConfig.phonegap = true;
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
        var options = {
            urn: rcConfig.urn,
            port: rcConfig.port,
            identityToken: authcontroller.getIdentityToken(),
            serviceAddress: config.serviceAddress,
            projectPath: path.join(process.cwd(), 'phonegap')
        };

        phonegapIntegration.setIntegration(options, function (error) {
            if (error) {
                console.error(error.toString());
                process.exit(1);
            }

            console.log('PhoneGap package successfully prepared.');
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
