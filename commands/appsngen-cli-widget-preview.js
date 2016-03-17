var jsonfile = require('jsonfile');
var path = require('path');
var fs = require('fs');
var fsExt = require('fs-extra');
var execSync = require('child_process').execSync;

var widgetPath;
var devboxPath = path.join(process.mainModule.children[0].paths[1], '/appsngen-dev-box');
var devboxConfigPath = path.join(devboxPath, '/serverConfig.json');
var devboxConfig = jsonfile.readFileSync(devboxConfigPath);
var projectConfig = jsonfile.readFileSync('./.appsngenrc');
var archiveName = path.basename(projectConfig.zipFilePath);

if (devboxConfig && projectConfig) {
    execSync('rm -r ' + path.join(devboxPath, '/widgets'), {
        stdio: 'inherit'
    });
    fs.mkdirSync(path.join(devboxPath, '/widgets'));
    try {
        fsExt.copySync(path.resolve(projectConfig.zipFilePath), path.join(devboxPath, '/widgets/', archiveName));
    } catch (err) {
        console.error(err);
    }
    devboxConfig.widgets = [path.join('/widgets/', archiveName)];
    jsonfile.writeFileSync(devboxConfigPath, devboxConfig);
} else if (!devboxConfig) {
    console.error('DevBox config wasn\'t found.');
} else {
    console.error('Project config wasn\'t found.');
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
