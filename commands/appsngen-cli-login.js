var co = require('co');
var prompt = require('co-prompt');
var request = require('request');
var jsonfile = require('jsonfile');
var path = require('path');
var authcontroller = require('./../src/authcontroller');

var serviceAddress = 'https://www.appsngen.com/rest-services/tokens'; //get service address from .appsngenrc file
var configFilePath = path.join(__dirname, '/..', '/cli-config.json');

co(function * () {
    var credentials;
    var username = yield prompt('username: ');
    var password = yield prompt.password('password: ');

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
});