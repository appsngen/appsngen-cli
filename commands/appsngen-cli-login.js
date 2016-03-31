var readlineSync = require('readline-sync');
var request = require('request');
var jsonfile = require('jsonfile');
var path = require('path');
var authcontroller = require('./../src/authcontroller');
var config = require('./../cli-config');

authcontroller.authorize()
    .then(function (response) {
        var config;
        var configFilePath = path.join(__dirname, '/../cli-config.json');

        if (response.statusCode === 201) {
            config = jsonfile.readFileSync(configFilePath);
            config.credentials = response.body;
            config.credentials.received = Date.now();
            jsonfile.writeFileSync(configFilePath, config, {
                spaces: 4
            });
            console.log('Authorization completed successfully.');
        } else {
            console.log(response.body.message);
            console.log('Unexpected response: ' + response.statusCode);
            process.exit(1);
        }
    })
    .catch(function(error) {
        console.log('catcher catch');
        console.error(error);
        process.exit(1);
    });