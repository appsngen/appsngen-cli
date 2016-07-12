(function () {
    'use strict';

    /*jshint -W079 */

    var jsonfile = require('jsonfile');
    var path = require('path');
    var fs = require('fs');
    var fsExt = require('fs-extra');
    var child_process = require('child_process');
    var open = require('open');

    var devboxConfig, projectConfig, archiveName;
    var devboxPath = path.dirname(require.resolve('appsngen-dev-box'));
    var devboxCachePath = path.join(devboxPath, 'views', 'config.json');
    var devboxConfigPath = path.join(devboxPath, '/serverConfig.json');
    var errorHandler = function(error) {
        console.error(error.toString());
        process.exit(1);
    };

    try {
        devboxConfig = jsonfile.readFileSync(devboxConfigPath);
        projectConfig = jsonfile.readFileSync('./.appsngenrc');
    } catch (error) {
        errorHandler(error);
    }

    archiveName = path.basename(projectConfig.zipFilePath);
    fsExt.remove(path.join(devboxPath, '/widgets'), function(error) {
        if (error) {
            errorHandler(error);
        }
        fs.mkdirSync(path.join(devboxPath, '/widgets'));
        fsExt.copySync(path.resolve(projectConfig.zipFilePath), path.join(devboxPath, '/widgets/', archiveName));
        devboxConfig.widgets = [path.join('/widgets/', archiveName)];
        jsonfile.writeFileSync(devboxConfigPath, devboxConfig, {
            spaces: 4
        });
        try {
            if (fs.statSync(devboxCachePath).isFile()) {
                fs.unlinkSync(devboxCachePath);
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                errorHandler(err);
            }
        }
        child_process.fork('server.js', {
            cwd: devboxPath
        });
        open(devboxConfig.viewerProtocol + '://' + devboxConfig.devBoxHost + ':' + devboxConfig.devBoxPort +
        '/views/index.html');
        console.log('CTRL + C to shutdown dev-box server');
    });
})();
