(function () {
    'use strict';

    var authcontroller = require('./../src/authcontroller');
    var registrycontroller = require('./../src/registrycontroller');

    authcontroller
        .authorize()
        .then(function (response) {
            var appsngenCredentials;

            switch (response.statusCode) {
                case 201:
                    appsngenCredentials = response.body;
                    appsngenCredentials.received = Date.now();
                    registrycontroller.removeCredentials();
                    registrycontroller.addCredentials('appsngen', appsngenCredentials);
                    console.log('Authorization completed successfully.');
                    break;
                case 401:
                    console.log('Invalid username or password.');
                    process.exit(1);
                    break;
                default:
                    console.log(response.body.message);
                    console.log('Unexpected response: ' + response.statusCode);
                    process.exit(1);
            }
        })
        .catch(function(error) {
            console.error(error);
            process.exit(1);
        });
})();
