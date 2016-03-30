(function() {
    'use strict';
    /*jshint bitwise: false*/

    var execSync = require('child_process').execSync;
    var jsonfile = require('jsonfile');
    var path = require('path');
    var request = require('request');
    var config = require('./../cli-config.json');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; //WARNING should be removed

    var refreshToken = function() {
        //TODO implement mechanism to refresh token
        try {
            execSync('appsngen login', {
                stdio: 'inherit'
            });
        } catch (err) {
            cosnole.error(err.toString());
            process.exit(1);
        }
    };

    exports.isAuthorized = function () {
        if (config.credentials &&
            (config.credentials.expiresIn + config.credentials.received) >= Date.now()) {
            return true;
        }

        return false;
    };

    exports.encodeToBase64 = function (input) {
        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var output = '', chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output += keyStr.charAt(enc1);
            output += keyStr.charAt(enc2);
            output += keyStr.charAt(enc3);
            output += keyStr.charAt(enc4);
        }
        return output;
    };

    exports.getIdentityToken = function() {
        try {
            if (!this.isAuthorized()) {
                refreshToken();
                config = jsonfile.readFileSync(path.join(__dirname, './../cli-config.json'));
            }
            return config.credentials.identityToken;
        } catch (err) {
            if (err.cmd && err.cmd === 'appsngen login') {
                console.log('You should login to appsngen.');
            } else {
                console.error(err.toString());
            }
            process.exit(1);
        }
    };
})();