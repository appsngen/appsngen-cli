(function () {
    'use strict';

    var path = require('path');
    var bluebird = require('bluebird');
    var request = require('request');
    var jsonfile = require('jsonfile');
    var execSync = require('child_process').execSync;
    var Promise = bluebird.Promise;
    var post = Promise.promisify(request.post);
    var statSync = require('fs').statSync;
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');
    var registrycontroller = require('./registrycontroller');
    var _s = require('underscore.string');

    //add file extension to current file in this extension not exists
    exports.normalizePathToCurrentFile = function () {
        var currentFile = process.argv[1];
        if (path.extname(currentFile) !== '.js') {
            currentFile += '.js';
        }
        process.argv[1] = currentFile;
    };

    exports.validateWidgetName = function (widgetName) {
        var widgetId = _s.slugify(widgetName);

        return authcontroller.getWidgetAccessToken()
            .then(function (response) {
                return post(config.serviceAddress + '/rest-services/widgets/is-valid', {
                    body: {
                        name: widgetName,
                        id: widgetId
                    },
                    json: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + response.body.accessToken
                    }
                });
            })
            .then(function (response) {
                if (response.statusCode === 200) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(response.body.message);
                }
            });
    };
    
    exports.isProjectFolder = function (widgetPath) {
        //TODO create more complete check
        try {
            return !!statSync(path.join(widgetPath, '.appsngenrc'));
        } catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            } else {
                throw err;
            }
        }
    };

    exports.checkSystemConfiguration = function () {
        var systemInfo = JSON.parse(execSync('npm ls -g --json generator-appsngen-web-widget').toString());
        var generatorInfo = systemInfo.dependencies['generator-appsngen-web-widget'];
        var generatorRequirements = (jsonfile.readFileSync(path.join(__dirname, '..', 'package.json')))
                .dependencies['generator-appsngen-web-widget'];

        if (generatorInfo && generatorInfo.version !== generatorRequirements) {
            console.error('Generating aborted.\n' +
                          'You have globally installed old version of generator-appsngen-web-widget\n' +
                          'For correct work of appsngen-cli you should either delete global generator, \n' +
                          'or update generator to version ' + generatorRequirements);
            process.exit(1);
        }
    };

    exports.workByWidgetName = function (name) {
        var widgetsList;

        try {
            widgetsList = registrycontroller.getWidgetsList();

            if (typeof name !== 'undefined') {
                if (widgetsList[name]) {
                    process.chdir(widgetsList[name].path);
                } else {
                    throw 'Widget "' + name + '" doesn\'t exist';
                }
            } else if (!this.isProjectFolder(process.cwd())) {
                throw 'Current folder isn\'t appsngen widget project.';
            }
        } catch (err) {
            console.error(err.toString());
            process.exit(1);
        }
    };

    exports.getPhonegapCredentials = function () {
        return config.credentials.phonegap;
    };

    exports.checkPhonegapAuthorization = function () {
        var phonegapCredentials = this.getPhonegapCredentials();

        if (!phonegapCredentials || !phonegapCredentials.access_token) {
            console.error('You don\'t have PhoneGap Build access token.\n' +
                'Use "appsngen phonegap access" command to get one.');
            process.exit(1);
        }
    };


    exports.getWidgetNameByPath = function (widgetPath) {
        var name;
        var widgetsList = registrycontroller.getWidgetsList();
        widgetPath = path.resolve(widgetPath);

        for (name in widgetsList) {
            if (widgetsList[name].path === widgetPath) {
                return name;
            }
        }
        console.error('No widgets registered in ' + widgetPath);
        process.exit(1);
    };
})();
