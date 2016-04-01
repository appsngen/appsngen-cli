(function() {
    'use strict';

    var Promise = require('bluebird').Promise;
    var jsonfile = require('jsonfile');
    var request = require('request');
    var fs = require('fs');
    var path = require('path');
    var put = Promise.promisify(request.put);
    var post = Promise.promisify(request.post);
    var readFile = Promise.promisify(fs.readFile);
    var waterfall = require('async-waterfall');
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');

    exports.uploadWidget = function (settings, callback) {
        var options = {};
        var serviceAddress = config.serviceAddress;
        var zipFilePath = settings.zipFilePath;
        var replaceIfExists = settings.replaceIfExists;

        return Promise.all([
                post(serviceAddress +  '/rest-services/tokens/access',
                    {
                        body: {
                            scope: {
                                widgets: [],
                                dataSources: [],
                                services: [
                                    'widgets'
                                ],
                                streams: [],
                                identity: false
                            }
                        },
                        json: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + authcontroller.getIdentityToken()
                        }
                    }),
                readFile(zipFilePath, 'binary')
            ])
            .then(function (result) {
                options.token = result[0].body.accessToken;
                options.zipFile = new Buffer(result[1], 'binary');
                return post(serviceAddress + '/viewer/widgets',
                            {
                                body: options.zipFile,
                                headers: {
                                    'Content-Type': 'application/zip',
                                    'Authorization': 'Bearer ' + options.token
                                }
                            });
            })
            .then(function (response) {
                if (response.statusCode === 409) {
                    if (!replaceIfExists) {
                        throw new Error('To replace existing widget, set replaceIfExists option to \'true\'');
                    }
                    console.log('Post upload conflict, trying to update existing widget...');
                    return put(serviceAddress + '/viewer/widgets',
                                {
                                    body: options.zipFile,
                                    headers: {
                                        'Content-Type': 'application/zip',
                                        'Authorization': 'Bearer ' + options.token
                                    }
                                });
                } else {
                    return Promise.resolve(response);
                }
            })
            .then(function (response) {
                console.log('Upload success!');
                options.urn = JSON.parse(response.body).urn;
                return Promise.resolve(options.urn);
            })
            .then(function (urn) {
                var rcConfigPath = path.join(process.cwd(), './.appsngenrc');
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