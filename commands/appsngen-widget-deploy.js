'use strict';

/*jshint -W079 */

var uploader = require('./../src/uploadcontroller');
var config = require('./../cli-config.json');
var jsonfile = require('jsonfile');
var path = require('path');
var open = require('open');

var rcConfig;
var rcConfigPath = path.join(process.cwd(), './.appsngenrc');

try {
    rcConfig = jsonfile.readFileSync(rcConfigPath);
    uploader.uploadWidget(rcConfig)
    .then(function (urn) {
        if (rcConfig.openInBrowserAfterUpload) {
             open(config.serviceAddress + '/product/marketplace/widgets/config/' + urn);
        }
    });
} catch (error) {
    console.error(error.toString());
    process.exit(1);
}