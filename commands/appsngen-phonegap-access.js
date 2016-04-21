(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var authcontroller = require('./../src/authcontroller');
    var path = require('path');
    var jsonfile = require('jsonfile');
    var Promise = require('bluebird').Promise;
    var request = Promise.promisify(require('request'));
    var config = require('./../cli-config.json');

    var authToken;
    var serviceAddress = config.serviceAddress + '/viewer/api/v1/phonegap-access-token';
    var requestOptions = {
        url: serviceAddress + (authToken ? '?phonegap-auth-token=' + authToken : ''),
        method: 'GET',
        headers: [
            {
                name: 'content-type',
                value: 'application/json'
            },
            {
                name: 'Authorization',
                value: 'Bearer ' + authcontroller.getIdentityToken()
            }
        ]
    };

    program
    .arguments('[token]')
    .action(function (token) {
        authToken = token;
    })
    .parse(process.argv);

    request(requestOptions)
    .then(function (response) {
        var config;
        var configFilePath = path.join(__dirname, './../cli-config.json');

        switch (response.statusCode) {
            case 200:
            config = jsonfile.readFileSync(configFilePath);
            config.credentials.phonegap = response.body;
            jsonfile.writeFileSync(configFilePath, config, {
                spaces: 4
            });
            console.log('Access token received.');
            break;
            case 404:
            console.log('No access token for specified user. Use "appsngen phonegap access [authToken]" to get one.' +
                'For instaructions how to get PhoneGap Authentication Token folow the link:' +
                'https://github.com/appsngen/developers-documentation/wiki/How-to-get-PhoneGap-Authentication-Tokens');
            process.exit(1);
            break;
            default:
            console.log(response.body.message);
            console.log('Unexpected response: ' + response.statusCode);
            process.exit(1);
        }
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });
})();