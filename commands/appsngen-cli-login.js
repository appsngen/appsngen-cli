var readlineSync = require('readline-sync');
var request = require('request');
var jsonfile = require('jsonfile');
var path = require('path');
var authcontroller = require('./../src/authcontroller');
var config = require('./../cli-config.json');

var credentials, username, password;
var serviceAddress = config.serviceAddress + '/rest-services/tokens';
var configFilePath = path.join(__dirname, '/..', '/cli-config.json');

username = readlineSync.question('Enter your username: ');
password = readlineSync.question('Enter your password: ', {
  hideEchoBack: true
});
credentials = username + ':' + password;
request.post(serviceAddress,
    {
        body: authcontroller.tokenRequestBody,
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
            } catch (err) {
                console.error(err.toString());
                process.exit(1);
            }
            console.log('Authorisation complete successfully.');
        } else {
            console.log(body);
            console.log('Unexpected response: ' + response.statusCode);
            process.exit(1);
        }
    }
);