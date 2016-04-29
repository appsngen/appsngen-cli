(function () {
    'use strict';

    var jsonfile = require('jsonfile');
    var path = require('path');
    var authcontroller = require('./../src/authcontroller');

    authcontroller.authorize()
    .then(function (response) {
        var config;
        var configFilePath = path.join(__dirname, '/../cli-config.json');

        switch (response.statusCode) {
            case 201:
                config = jsonfile.readFileSync(configFilePath);
                config.credentials = {};
                config.credentials.appsngen = response.body;
                config.credentials.appsngen.received = Date.now();
                jsonfile.writeFileSync(configFilePath, config, {
                    spaces: 4
                });
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
