var readlineSync = require('readline-sync');
var request = require('request');
var jsonfile = require('jsonfile');
var path = require('path');
var deasync = require('deasync');
var authcontroller = require('./../src/authcontroller');
var config = require('./../cli-config');

var credentials, username, password;
var complete = false;
var serviceAddress = config.serviceAddress + '/rest-services/tokens/identity';
var configFilePath = path.join(__dirname, '/..', '/cli-config.json');

username = readlineSync.question('Enter username: ');
password = readlineSync.question('Enter password: ', {
  hideEchoBack: true
});
credentials = username + ':' + password;
request.post(serviceAddress,
    {
        body: {
            scope: {}
        },
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic: ' + authcontroller.encodeToBase64(credentials)
        }
    },
    function (error, response, body) {
        var config;

        if (error) {
            console.log(error.toString());
            process.exit(1);
        }
        if (response.statusCode === 201) {
            try {
                config = jsonfile.readFileSync(configFilePath);
                config.credentials = body;
                config.credentials.received = Date.now();
                jsonfile.writeFileSync(configFilePath, config, {
                    spaces: 4
                });
                complete = true;
            } catch (err) {
                console.error(err.toString());
                process.exit(1);
            }
            console.log('Authorization completed successfully.');
        } else {
            console.log(body.message);
            console.log('Unexpected response: ' + response.statusCode);
            process.exit(1);
        }
    }
);
deasync.loopWhile(function(){return !complete;});