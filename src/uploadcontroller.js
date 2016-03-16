(function() {
    'use strict';

    var jsonfile = require('jsonfile');
    var request = require('request');
    var fs = require('fs');
    var waterfall = require('async-waterfall');
    var npmOpen = require('open');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; //WARNING should be removed

    var encodeToBase64 = function (input) {

        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var output = '', chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output += keyStr.charAt(enc1);
            output += keyStr.charAt(enc2);
            output += keyStr.charAt(enc3);
            output += keyStr.charAt(enc4);
        }
        return output;
    };

    exports.uploadWidget = function (settings) {
        var serviceAddress = settings.serviceAddress;
        var zipFilePath = settings.zipFilePath;
        var replaceIfExists = settings.replaceIfExists;
        var openInBrowserAfterUpload = settings.openInBrowserAfterUpload;
        var credentials = settings.username + ':' + settings.password;

        var tokenRequestBody = {
            scope: {
                widgets: [],
                dataSources: [],
                services: [
                    'widgets'
                ],
                streams: [],
                identity: false
            }
        };

        // Processing block
        waterfall([
            function (callback) { //token request
                var options = {};

                request.post(
                    serviceAddress + '/rest-services/tokens',
                    {
                        body: tokenRequestBody,
                        json: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Basic: ' + encodeToBase64(credentials)
                        }
                    },
                    function (error, response, body) {
                        if (error) {
                            throw error;
                        }
                        if (!error && response.statusCode === 201) {
                            console.log('Get token success!');
                            options.token = body.accessToken;
                            callback(null, options);
                        }else{
                            console.log(body);
                            throw ('Unexpected response: '+response.statusCode);
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
                    function (error, response, body) {
                        if (error) {
                            throw error;
                        }
                        else {
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
                            }
                            else {
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
    };
})();
