(function() {
    'use strict';

    var execSync = require('child_process').execSync;
    var readlineSync = require('readline-sync');
    var post = require('bluebird').Promise.promisify(require('request').post);
    var config = require('./../cli-config.json');
    var registrycontroller = require('./../src/registrycontroller');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; //WARNING should be removed

    var refreshToken = function () {
        //TODO implement mechanism to refresh token
        try {
            execSync('appsngen login', {
                stdio: 'inherit'
            });
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };

    exports.isAuthorized = function () {
        var appsngenCredentials = registrycontroller.getCredentials().appsngen;

        return appsngenCredentials && (appsngenCredentials.expiresIn + appsngenCredentials.received) >= Date.now();
    };

    exports.getIdentityToken = function () {
        try {
            if (!this.isAuthorized()) {
                refreshToken();
            }
            return registrycontroller.getCredentials().appsngen.identityToken;
        } catch (error) {
            if (error.cmd && error.cmd === 'appsngen login') {
                console.log('You should login to appsngen.');
            } else {
                console.error(error.toString());
            }
            process.exit(1);
        }
    };

    exports.getWidgetAccessToken = function () {
        return post(config.serviceAddress +  '/rest-services/tokens/access',
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
                    'Authorization': 'Bearer ' + this.getIdentityToken()
                }
            });
    };

    exports.authorize = function () {
        var credentials, username, password;
        var serviceAddress = config.serviceAddress + '/rest-services/tokens/identity';

        username = readlineSync.question('Enter username: ');
        password = readlineSync.question('Enter password: ', {
            hideEchoBack: true
        });
        credentials = username + ':' + password;

        return post(serviceAddress, {
                    body: {
                        scope: {}
                    },
                    json: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic: ' + new Buffer(credentials).toString('base64')
                    }
                });
    };
})();
