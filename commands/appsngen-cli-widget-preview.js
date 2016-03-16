var jsonfile = require('jsonfile');
var path = require('path');
var fs = require('fs');
var fsExt = require('fs-extra');
var execSync = require('child_process').execSync;

var widgetPath;
var devboxPath = process.mainModule.children[0].paths[1] + '/appsngen-dev-box';
var devboxConfigPath = devboxPath + '/serverConfig.json';
var devboxConfig = jsonfile.readFileSync(devboxConfigPath);
var projectConfig = jsonfile.readFileSync('./.appsngenrc');
var archiveName = path.basename(projectConfig.zipFilePath);

if (devboxConfig && projectConfig) {
    execSync('rm -r ' + path.join(devboxPath, '/widgets'), {
        stdio: 'inherit'
    });
    fs.mkdirSync(path.join(devboxPath + '/widgets'));
    try {
        fsExt.copySync(path.resolve(projectConfig.zipFilePath), path.join(devboxPath, '/widgets/', archiveName));
    } catch (err) {
        console.error(err);
    }
    devboxConfig.widgets = Array('/widgets/' + archiveName);
    jsonfile.writeFileSync(devboxConfigPath, devboxConfig);
} else {
    console.error('One of the config files does not founded.');
}
//install devbox dependencies(routerhelpers.js require node_modules folder)
execSync('npm install', {
    cwd: devboxPath,
    stdio: 'inherit'
});
execSync('node server.js', {
    cwd: devboxPath,
    stdio: 'inherit'
});