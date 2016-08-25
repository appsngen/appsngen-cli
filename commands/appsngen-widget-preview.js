(function () {
    'use strict';

    /*jshint -W079 */

    var jsonfile = require('jsonfile');
    var path = require('path');
    var fs = require('fs');
    var fsExt = require('fs-extra');
    var child_process = require('child_process');
    var open = require('open');

    var devboxConfig;
    var projectConfig;
    var archiveName;
    var devBoxProcess;
    var devBoxAddress;
    var devboxPath = path.dirname(require.resolve('appsngen-dev-box'));
    var devboxCachePath = path.join(devboxPath, 'views', 'config.json');
    var devboxConfigPath = path.join(devboxPath, 'serverConfig.json');
    var errorHandler = function() {
        console.error('Unexpected error. Command aborted.');
        process.exit(1);
    };

    try {
        devboxConfig = jsonfile.readFileSync(devboxConfigPath);
        projectConfig = jsonfile.readFileSync(path.join('.', '.appsngenrc'));
    } catch (error) {
        errorHandler();
    }

    archiveName = path.basename(projectConfig.zipFilePath);
    fsExt.remove(path.join(devboxPath, '/widgets'), function(error) {
        if (error) {
            errorHandler();
        }
        fs.mkdirSync(path.join(devboxPath, 'widgets'));
        fsExt.copySync(path.resolve(projectConfig.zipFilePath), path.join(devboxPath, 'widgets', archiveName));
        devboxConfig.widgets = [path.join('widgets', archiveName)];
        jsonfile.writeFileSync(devboxConfigPath, devboxConfig, {
            spaces: 4
        });
        try {
            if (fs.statSync(devboxCachePath).isFile()) {
                fs.unlinkSync(devboxCachePath);
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                errorHandler();
            }
        }
        console.log('Starting DevBox ...');
        devBoxProcess = child_process.fork('server.js', {
            cwd: devboxPath,
            silent: true
        });
        devBoxProcess.on('message', function (message) {
            if (message === 'started') {
                devBoxAddress = devboxConfig.viewerProtocol + '://' + devboxConfig.devBoxHost + ':' +
                    devboxConfig.devBoxPort + '/views/index.html';
                console.log('DevBox successfully started at %s', devBoxAddress);
                open(devBoxAddress);
                console.log('CTRL + C to shutdown dev-box server');
            }
        });
    });
})();
