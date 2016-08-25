(function () {
    'use strict';

    var childProcess = require('child_process');
    var path = require('path');
    var fs = require('fs');
    var fsExtra = require('fs-extra');
    var program = require('./../src/customcommander');
    var helper = require('./../src/clihelper');
    var registrycontroller = require('./../src/registrycontroller');
    var phonegapcontroller = require('./../src/phonegapcontroller');
    var uploadcontroller = require('./../src/uploadcontroller');
    var Promise = require('bluebird').Promise;
    var exec = Promise.promisify(childProcess.exec);
    var readFile = Promise.promisify(require('jsonfile').readFile);

    var widgetName, widgetPath;

    program
        .usage('<name> [path]')
        .arguments('<name> [path]')
        .action(function (name, path) {
            widgetName = name;
            widgetPath = path;
        })
        .parse(process.argv);

    if (typeof widgetName === 'undefined') {
        console.error('No widget name provided');
        process.exit(1);
    }
    if (typeof widgetPath !== 'undefined') {
        widgetPath = path.resolve(widgetPath);
    } else {
        widgetPath = path.join(process.cwd(), widgetName);
    }
    try {
        if (registrycontroller.getWidgetsList()[widgetName]) {
            throw 'Widget with same name already exists.';
        }
        if (fs.readdirSync(widgetPath).length !== 0) {
            throw 'Path already exists and is not empty: ' + widgetPath;
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(error.toString());
            process.exit(1);
        }
    }

    console.log('Checking widget name.');
    helper.startLoadingIndicator();
    helper
        .validateWidgetName(widgetName)
        .then(function validateSystemConfiguration() {
            console.log('\b\rCheck completed successfully.');
            console.log('\b\rValidate system configuration.');
            return helper.checkSystemConfiguration(); // will terminate the process in case of failure
        }, function (rejectReason) {
            console.log('ERROR: ', rejectReason);
            process.exit(1);
        })
        .then(function generateProject() {
            console.log('\b\rValidation completed successfully.');
            fsExtra.mkdirsSync(widgetPath);
            try {
                childProcess.execSync('npm run yo appsngen-web-widget "' + path.resolve(widgetPath) +
                    '" "' + widgetName + '"', {
                        cwd: path.join(__dirname, '..'),
                        stdio: 'inherit'
                    });
                process.chdir(widgetPath);
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(error);
            }
        })
        .then(function readConfigFile() {
            return readFile(path.join(widgetPath, '.appsngenrc'));
        })
        .then(function uploadWidget(config) {
            return uploadcontroller.uploadWidget(config);
        })
        .then(function createPhonegapProject() {
            return phonegapcontroller.create();
        })
        .then(function buildProject() {
            registrycontroller.addWidget(widgetName, widgetPath);
            console.log('\b\rStart building process.');
            return exec('appsngen widget build "' + widgetName + '"');
        })
        .then(function () {
            helper.stopLoadingIndicator();
            console.log('Building process completed successfully.' +
                '\n\nWidget generation completed successfully.');
        })
        .catch(function (error) {
            if (typeof error === 'string') {
                console.error('ERROR:', error);
            }
            fsExtra.removeSync(widgetPath);
            childProcess.exec('appsngen widget list remove ' + widgetName, function (){
                console.error('Unexpected behavior: generation fail.');
                process.exit(1);
            });
        });
})();
