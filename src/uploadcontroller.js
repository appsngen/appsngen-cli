(function() {
    'use strict';

    var Promise = require('bluebird').Promise;
    var jsonfile = require('jsonfile');
    var path = require('path');
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');
    var upload = require('appsngen-widget-upload');

    exports.uploadWidget = function (settings) {
        var options = {
            token: authcontroller.getIdentityToken(),
            serviceAddress: config.serviceAddress,
            zipFilePath: settings.zipFilePath,
            replaceIfExists: settings.replaceIfExists
        };

        return upload(options)
            .then(function writeUrnToConfig(urn) {
                var rcConfigPath = path.join(process.cwd(), '.appsngenrc');
                var rcConfig = jsonfile.readFileSync(rcConfigPath);
                rcConfig.urn = urn;
                jsonfile.writeFileSync(rcConfigPath, rcConfig, {
                    spaces: 4
                });
                return Promise.resolve(urn);
            })
            .catch(function (error) {
                console.error(error.toString());
                process.exit(1);
            });
    };
})();
