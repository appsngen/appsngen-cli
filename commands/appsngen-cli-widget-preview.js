var jsonfile = require('jsonfile');
var path = require('path');
var fs = require('fs');
var fsExt = require('fs-extra');
var rmdir = require('rmdir');
var execSync = require('child_process').execSync;

var widgetPathw, devboxConfig, projectConfig, archiveName;
var devboxPath = path.join(process.mainModule.children[0].paths[1], '/appsngen-dev-box');
var devboxConfigPath = path.join(devboxPath, '/serverConfig.json');

try {
    devboxConfig = jsonfile.readFileSync(devboxConfigPath);
    projectConfig = jsonfile.readFileSync('./.appsngenrc');
    archiveName = path.basename(projectConfig.zipFilePath);
    rmdir(path.join(devboxPath, '/widgets'), function(err) {
        if (err) {
            throw err;
        }
        fs.mkdirSync(path.join(devboxPath, '/widgets'));
        fsExt.copySync(path.resolve(projectConfig.zipFilePath), path.join(devboxPath, '/widgets/', archiveName));
        devboxConfig.widgets = [path.join('/widgets/', archiveName)];
        jsonfile.writeFileSync(devboxConfigPath, devboxConfig, {
            spaces: 4
        });
        //install devbox dependencies(routerhelpers.js require node_modules folder)
        execSync('npm install', {
            cwd: devboxPath,
            stdio: 'inherit'
        });
        execSync('node server.js', {
            cwd: devboxPath,
            stdio: 'inherit'
        });
    });
} catch (err) {
    console.error(err.toString());
    process.exit(1);
}
