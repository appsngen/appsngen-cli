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
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');

    exports.uploadWidget = function (settings) {
        var options = {
            token: authcontroller.getIdentityToken()
        };
        var serviceAddress = config.serviceAddress;
        var zipFilePath = settings.zipFilePath;
        var replaceIfExists = settings.replaceIfExists;

        return readFile(zipFilePath, 'binary')
            .then(function (zipData) {
                options.zipFile = new Buffer(zipData, 'binary');
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
                switch (response.statusCode) {
                    case 200:
                    case 201:
                        console.log('Upload success!');
                        options.urn = JSON.parse(response.body).urn;
                        return Promise.resolve(options.urn);
                    case 400:
                        console.log('Upload failed.\n' +
                                    'Bad widget package.');
                        process.exit(1);
                        break;
                    default:
                        console.log('Unexpected response from backend. Please try again.');
                        process.exit(1);
                        break;
                }
            })
            .then(function (urn) {
                var rcConfigPath = path.join(process.cwd(), '/.appsngenrc');
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
