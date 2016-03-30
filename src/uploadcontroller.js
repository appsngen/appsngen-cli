(function() {
    'use strict';
    /*jshint bitwise: false*/

    var jsonfile = require('jsonfile');
    var request = require('request');
    var fs = require('fs');
    var waterfall = require('async-waterfall');
    var deasync = require('deasync');
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');

    exports.uploadWidget = function (settings) {
        var complete = false;
        var serviceAddress = config.serviceAddress;
        var zipFilePath = settings.zipFilePath;
        var replaceIfExists = settings.replaceIfExists;

        // Processing block
        waterfall([
            function (callback) { //token request
                var options = {};
                request.post(
                   serviceAddress +  '/rest-services/tokens/access',
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
                   },
                   function (error, response, body) {
                       if (error) {
                           throw error;
                       } else {
                           options.token = body.accessToken;
                           callback(null, options);
                       }
                   }
                );
            },
            function (options, callback) { // read zip file
                fs.readFile(zipFilePath, 'binary', function (err, data) {
                    if (err) {
                        throw err;
                    }
                    options.zipFile = new Buffer(data, 'binary');
                    console.log('File read success!');
                    callback(null, options);
                });
            },
            function (options, callback) { //upload
                request.post(
                    serviceAddress + '/viewer/widgets',
                    {
                        body: options.zipFile,
                        headers: {
                            'Content-Type': 'application/zip',
                            'Authorization': 'Bearer ' + options.token
                        }
                    },
                    function (error, response) {
                        if (error) {
                            throw error;
                        } else {
                            options.statusCode = response.statusCode;
                            options.urn = JSON.parse(response.body).urn;
                            callback(null, options);
                        }
                    }
                );
            },
            function (options, callback) { //update if already exists
                if (options.statusCode === 409) {
                    if (!replaceIfExists) {
                        console.log('To replace existing widget, set replaceIfExists option to \'true\'');
                        return;
                    }
                    console.log('Post upload conflict, trying to update existing widget...');
                    request.put(
                        serviceAddress + '/viewer/widgets',
                        {
                            body: options.zipFile,
                            headers: {
                                'Content-Type': 'application/zip',
                                'Authorization': 'Bearer ' + options.token
                            }
                        },
                        function (error, response) {
                            if (error) {
                                throw error;
                            } else {
                                console.log('Upload success!');
                                options.urn = JSON.parse(response.body).urn;
                                callback(null, options);
                            }
                        }
                    );
                } else {
                    console.log('Upload success!');
                    callback(null, options);
                }
            },
            function (options) {
                var rcConfig;
                var rcConfigPath = process.cwd() + '/.appsngenrc';

                try {
                    rcConfig = jsonfile.readFileSync(rcConfigPath);
                    rcConfig.urn = options.urn;
                    jsonfile.writeFileSync(rcConfigPath, rcConfig, {
                        spaces: 4
                    });
                    complete = true;
                } catch (err) {
                    console.error(err.toString());
                    process.exit(1);
                }
            }
        ]);
        deasync.loopWhile(function(){return !complete;});
    };
})();
