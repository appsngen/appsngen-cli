(function() {
    'use strict';

    var authcontroller = require('./authcontroller');
    var jsonfile = require('jsonfile');
    var request = require('request');
    var fs = require('fs');
    var waterfall = require('async-waterfall');
    var npmOpen = require('open');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; //WARNING should be removed

    exports.uploadWidget = function (settings) {
        var that = this;
        var serviceAddress = settings.serviceAddress;
        var zipFilePath = settings.zipFilePath;
        var replaceIfExists = settings.replaceIfExists;
        var openInBrowserAfterUpload = settings.openInBrowserAfterUpload;
        var credentials = settings.username + ':' + settings.password;

        authcontroller.getToken();
        // Processing block
        waterfall([
            function (callback) { //token request
                var options = {};

                options.token = authcontroller.getToken();
                callback(null, options);
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
                    function (error, response, body) {
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
            function (options, callback) {
                var configFile = process.cwd() + '/.appsngenrc';

                jsonfile.readFile(configFile, function(err, obj) {
                    obj.urn = options.urn;
                    jsonfile.writeFile(configFile, obj, {
                        spaces: 4
                    },function (err) {
                        if (err) {
                            console.error(err);
                        }
                    });
                });
                callback(null, options);
            },
            function (options) { // open in browser
                if (openInBrowserAfterUpload) {
                    npmOpen(serviceAddress + '/product/marketplace/widgets/config/' + options.urn);
                }
        }]);
    }
})();
