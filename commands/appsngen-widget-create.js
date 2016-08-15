(function () {
    'use strict';

    var childProcess = require('child_process');
    var path = require('path');
    var fs = require('fs');
    var fsExtra = require('fs-extra');
    var program = require('./../src/customcommander');
    var helper = require('./../src/clihelper');
    var registrycontroller = require('./../src/registrycontroller');
    var Promise = require('bluebird').Promise;

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

    helper
        .validateWidgetName(widgetName)
        .then(function () {
            console.log('Check system configuration.');
            // will terminate the process in case of failure
            helper.checkSystemConfiguration();
            console.log('Check completed successfully.');
            return Promise.resolve();
        }, function (rejectReason) {
            console.log('ERROR: ', rejectReason);
            process.exit(1);
        })
        .then(function generateProject() {
            fsExtra.mkdirsSync(widgetPath);
            childProcess.execSync('npm run yo appsngen-web-widget "' + path.resolve(widgetPath) +
                '" "' + widgetName + '"', {
                    cwd: path.join(__dirname, '..'),
                    stdio: 'inherit'
                });
        })
        .then(function buildProject() {
            registrycontroller.addWidget(widgetName, widgetPath);
            childProcess.execSync('appsngen widget build "' + widgetName + '"', {
                stdio: 'inherit'
            });
        })
        .catch(function () {
            fsExtra.removeSync(widgetPath);
            childProcess.exec('appsngen widget list remove ' + widgetName, function (){
                console.error('Unexpected behavior: generation fail.');
                process.exit(1);
            });
        });
})();
