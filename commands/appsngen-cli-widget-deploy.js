var uploader = require('./../src/uploadcontroller');
var jsonfile = require('jsonfile');
var path = require('path');

var rcConfig;
var rcConfigPath = path.join(process.cwd(), './.appsngenrc');

try {
    rcConfig = jsonfile.readFileSync(rcConfigPath);
    uploader.uploadWidget(rcConfig)
    .then(function (urn) {
        rcConfig.urn = urn;
        jsonfile.writeFileSync(rcConfigPath, rcConfig, {
            spaces: 4
        });
    });
} catch (error) {
    console.log('LOGIN COMMAND ERROR');
    console.error(error.toString());
    process.exit(1);
}