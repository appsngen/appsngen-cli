(function () {
    'use strict';

    var Table = require('easy-table');
    var helper = require('./../src/clihelper');
    var phonegapIntegration = require('appsngen-phonegap-integration');

    var accessToken;

    helper.checkPhonegapAuthorization(); // will terminate process if not authorized
    accessToken = helper.getPhonegapCredentials().access_token;

    phonegapIntegration.getKeys('', accessToken, function (error, keys) {
        var table;

        if (error) {
            console.error('Error: unable to get siging key. Please try again later.');
            process.exit(1);
        }

        table = new Table();
        phonegapIntegration.SUPPORTED_PLATFORMS.forEach(function (el) {
            keys[el].all.forEach(function (key) {
                table.cell('Platform', el);
                table.cell('ID', key.id);
                table.cell('Title', key.title);
                table.newRow();
            });
        });
        if (table.rows.length) {
            console.log(table.toString());
        } else {
            console.log('No singing key available.');
        }
    });
})();
