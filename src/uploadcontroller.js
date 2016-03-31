(function() {
    'use strict';

    var bluebird = require('bluebird');
    var jsonfile = require('jsonfile');
    var request = require('request');
    var put = bluebird.Promise.promisify(request.put);
    var post = bluebird.Promise.promisify(request.post);
    var readFile = bluebird.Promise.promisify(require('fs').readFile);
    var waterfall = require('async-waterfall');
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');

    exports.uploadWidget = function (settings, callback) {
        var options = {};
        var serviceAddress = config.serviceAddress;
        var zipFilePath = settings.zipFilePath;
        var replaceIfExists = settings.replaceIfExists;

        return bluebird.Promise.all([
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
                    return bluebird.Promise.resolve(response);
                }
            })
            .then(function (response) {
                console.log('Upload success!');
                options.urn = JSON.parse(response.body).urn;
                return bluebird.Promise.resolve(options.urn);
            })
            .catch(function (error) {
                console.log('UPLOAD CONTROLLER ERRROR');
                console.error(error.toString());
                process.exit(1);
            });
    };
})();