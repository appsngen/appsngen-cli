(function () {
    'use strict';

    var childProcess = require('child_process');
    var path = require('path');
    var request = require('request');
    var jsonfile = require('jsonfile');
    var stringSimilarity = require('string-similarity');
    var Promise = require('bluebird').Promise;
    var exec = Promise.promisify(childProcess.exec);
    var post = Promise.promisify(request.post);
    var statSync = require('fs').statSync;
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');
    var registrycontroller = require('./registrycontroller');
    var _s = require('underscore.string');

    var indicatorId;

    exports.startLoadingIndicator = function () {
        var indicatorSymbolInd = 0;
        var animationInterval = 75; // ms
        var waitSymbols = [
            '-',
            '\\',
            '|',
            '/'
        ];

        if (!indicatorId) {
            indicatorId = setInterval(function () {
                indicatorSymbolInd = ++indicatorSymbolInd % 4;
                process.stdout.write('\b\r' + waitSymbols[indicatorSymbolInd]);
            }, animationInterval);
        }
    };

    exports.stopLoadingIndicator = function () {
        clearInterval(indicatorId);
        process.stdout.write('\b\r');
        indicatorId = 0;
    };

    // add file extension to current file in this extension not exists
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
            .then(function validateWidgetNameUsingRestServices(response) {
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
        // TODO create more complete check
        try {
            return Boolean(statSync(path.join(widgetPath, '.appsngenrc')));
        } catch (error) {
            if (error.code === 'ENOENT') {
                return false;
            } else {
                throw error;
            }
        }
    };

    exports.checkSystemConfiguration = function () {
        var systemInfo, generatorInfo, generatorRequirements;
        var command = 'npm ls -g --json generator-appsngen-web-widget';

        return exec(command).then(function processSystemConfigurationInformation(stdout) {
            systemInfo = JSON.parse(stdout);
            generatorInfo = systemInfo.dependencies['generator-appsngen-web-widget'];
            generatorRequirements = (jsonfile.readFileSync(path.join(__dirname, '..', 'package.json')))
                    .dependencies['generator-appsngen-web-widget'];

            if (generatorInfo && generatorInfo.version !== generatorRequirements) {
                return Promise.reject('Generating aborted.\n' +
                              'You have globally installed old version of generator-appsngen-web-widget\n' +
                              'For correct work of appsngen-cli you should either delete global generator, \n' +
                              'or update generator to version ' + generatorRequirements);
            } else {
                return Promise.resolve();
            }
        }, function (error) {
            if (error.cmd.indexOf(command) >= 0) {
                // no generator installed in system configuration acceptable
                return Promise.resolve();
            } else {
                return Promise.reject(error);
            }
        });
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
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };

    exports.getPhonegapCredentials = function () {
        return registrycontroller.getCredentials().phonegap;
    };

    exports.checkPhonegapAuthorization = function () {
        var phonegapCredentials = this.getPhonegapCredentials();

        if (!phonegapCredentials || !phonegapCredentials.access_token) {
            console.error('You don\'t have PhoneGap Build access token.\n' +
                'Use "appsngen phonegap access" command to get one.');
            process.exit(1);
        }
    };

    exports.checkAppsngenAuthorization = function () {
        try {
            if (!authcontroller.isAuthorized()) {
                childProcess.execSync('appsngen login', {
                    stdio: 'inherit'
                });
            }
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };

    exports.getWidgetPhonegapId = function (name) {
        var widgetList = registrycontroller.getWidgetsList();
        var id = widgetList[name].phonegapId;

        if (id) {
            return id;
        } else {
            console.log('Widget doesn\'t have PhoneGap Id.');
            console.log('Use "appsngen widget remote register" command to resolve this issue.');
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

    exports.addHelpForInvalidCommand = function (commander) {
        commander
            .command('*', 'unknow command', {noHelp: true})
            .action(function (command) {
                var commandName;
                var bestMatch;
                var commandNames = [];

                if (!this._execs[command] && !this.defaultExecutable) {
                    for (commandName in this._execs) {
                        if (this._execs.hasOwnProperty(commandName) && commandName !== '*') {
                            commandNames.push(commandName);
                        }
                    }
                    bestMatch = stringSimilarity.findBestMatch(command, commandNames).bestMatch;

                    if (bestMatch.rating >= 0.5) {
                        console.log('Unknown command: %s', command);
                        console.log('Did you mean?\n\t', this._name.split('-').join(' '), bestMatch.target);
                    } else {
                        this.help();
                    }
                }
            });
    };
})();
