(function () {
    'use strict';

    var program = require('./../src/customcommander');
    var authcontroller = require('./../src/authcontroller');
    var helper = require('./../src/clihelper');
    var Promise = require('bluebird').Promise;
    var request = Promise.promisify(require('request'));
    var config = require('./../cli-config.json');
    var registrycontroller = require('./../src/registrycontroller');

    var authToken;
    var requestOptions = {
        url: config.serviceAddress + '/viewer/api/v1/phonegap-access-token',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authcontroller.getIdentityToken()
        }
    };

    program
        .arguments('[token]')
        .action(function (token) {
            authToken = token;
        })
        .parse(process.argv);

    helper.checkAppsngenAuthorization(); //will terminate process in case of authorization fail

    if (typeof authToken !== 'undefined') {
        requestOptions.method = 'POST';
        requestOptions.body = JSON.stringify({
            'phonegap-auth-token': authToken
        });
    } else {
        requestOptions.method = 'GET';
    }

    request(requestOptions)
        .then(function (response) {
            switch (response.statusCode) {
                case 200:
                case 201:
                    registrycontroller.addCredentials('phonegap', JSON.parse(response.body));
                    console.log('Access token received.');
                    break;
                case 400:
                    console.log('Bad PhoneGap authentication token.');
                    process.exit(1);
                    break;
                case 404:
                    console.log('No access token for specified user.\n' +
                                'Use "appsngen phonegap access [authToken]" to get one.\n' +
                                'For instructions how to get PhoneGap Authentication Token follow the link:\n' +
                                'https://github.com/appsngen/developers-documentation/' +
                                'wiki/How-to-get-PhoneGap-Authentication-Tokens');
                    process.exit(1);
                    break;
                default:
                    console.log('Unexpected response from backend. Please try again.');
                    process.exit(1);
                    break;
            }
        })
        .catch(function (error) {
            console.error(error.toString());
            process.exit(1);
        });
})();
