(function () {
    'use strict';

    var request = require('request');
    var Table = require('easy-table');
    var helper = require('./../src/clihelper');
    var cordovacontroller = require('./../src/cordovacontroller');

    var accessToken;

    helper.checkPhonegapAuthorization(); //will terminate process if not authorized
    accessToken = helper.getPhonegapCredentials().access_token;

    request.get('https://build.phonegap.com/api/v1/keys?access_token=' + accessToken, function (error, response) {
        var keys, table;

        if (error) {
            console.error(error.toString());
            process.exit(1);
        }

        if (response.statusCode === 200) {
            table = new Table();
            keys = JSON.parse(response.body).keys;
            cordovacontroller.REMOTE_SUPPORTED_PLATFORMS.forEach(function (el) {
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
        } else {
            console.log('Something goes wrong. Try again.');
            process.exit(1);
        }
    });
})();
