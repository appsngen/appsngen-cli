(function () {
    'use strict';

    /*jshint -W079 */

    var uploader = require('./../src/uploadcontroller');
    var config = require('./../cli-config.json');
    var jsonfile = require('jsonfile');
    var path = require('path');
    var open = require('open');
    var Promise = require('bluebird').Promise;
    var readFile = Promise.promisify(jsonfile.readFile);

    var rcConfig;
    var rcConfigPath = path.join(process.cwd(), '.appsngenrc');

    readFile(rcConfigPath)
        .then(function uploadWidget(configData) {
            rcConfig = configData;

            return uploader.uploadWidget(rcConfig);
        })
        .then(function openWidgetInBrowser(urn) {
            console.log('Upload success.');
            if (rcConfig.openInBrowserAfterUpload) {
                open(config.serviceAddress + '/product/widgets/' + urn + '/config');
            }
        })
        .catch(function (error) {
            switch (error.code) {
                case 'ENOTFOUND':
                    console.error('Connection error: Unable to access %s', config.serviceAddress);
                    break;
                default:
                    console.error('Error: unable to deploy widget. Please try again later.');
            }
            process.exit(1);
        });
})();
