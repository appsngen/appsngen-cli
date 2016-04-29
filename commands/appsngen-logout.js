(function () {
    'use strict';

    var jsonfile = require('jsonfile');
    var path = require('path');

    var config;
    var configPath = path.join(__dirname, './../cli-config.json');

    try {
        config = jsonfile.readFileSync(configPath);
        config.credentials = null;
        jsonfile.writeFileSync(configPath, config, {
            spaces: 4
        });
    } catch (error) {
        console.error(error.toString());
        process.exit(1);
    }
})();