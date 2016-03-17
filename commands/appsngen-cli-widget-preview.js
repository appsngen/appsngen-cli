var jsonfile = require('jsonfile');
var path = require('path');
var fs = require('fs');
var fsExt = require('fs-extra');
var execSync = require('child_process').execSync;

var widgetPathw, devboxConfig, projectConfig, archiveName;
var devboxPath = path.join(process.mainModule.children[0].paths[1], '/appsngen-dev-box');
var devboxConfigPath = path.join(devboxPath, '/serverConfig.json');

try {
    devboxConfig = jsonfile.readFileSync(devboxConfigPath);
    projectConfig = jsonfile.readFileSync('./.appsngenrc');
} catch (err) {
    console.error(err.toString());
    return;
}

try {
    archiveName = path.basename(projectConfig.zipFilePath);
    execSync('rm -r ' + path.join(devboxPath, '/widgets'), {
        stdio: 'inherit'
    });
    fs.mkdirSync(path.join(devboxPath, '/widgets'));
    fsExt.copySync(path.resolve(projectConfig.zipFilePath), path.join(devboxPath, '/widgets/', archiveName));
    devboxConfig.widgets = [path.join('/widgets/', archiveName)];
    jsonfile.writeFileSync(devboxConfigPath, devboxConfig);
} catch (err) {
    console.error(err.toString());
    return;
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