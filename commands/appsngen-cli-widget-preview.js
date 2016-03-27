var jsonfile = require('jsonfile');
var path = require('path');
var fs = require('fs');
var fsExt = require('fs-extra');
var rmdir = require('rmdir');
var child_process = require('child_process')
var open = require('open');

var devboxConfig, projectConfig, archiveName;
var devboxPath = path.join(process.mainModule.paths[1], '/appsngen-dev-box');
var devboxConfigPath = path.join(devboxPath, '/serverConfig.json');
var errorHandler = function(error) {
    console.error(error.toString());
    process.exit(1);
};
var installDevBoxDependencies = function() {
    console.log('Installing required dependencies...');
    child_process.execSync('npm install', {
        cwd: devboxPath,
        stdio: 'inherit'
    });
};

try {
    devboxConfig = jsonfile.readFileSync(devboxConfigPath);
    projectConfig = jsonfile.readFileSync('./.appsngenrc');
} catch (err) {
    errorHandler(err);
}

archiveName = path.basename(projectConfig.zipFilePath);
rmdir(path.join(devboxPath, '/widgets'), function(err) {
    if (err) {
        errorHandler(err);
    }
    fs.mkdirSync(path.join(devboxPath, '/widgets'));
    fsExt.copySync(path.resolve(projectConfig.zipFilePath), path.join(devboxPath, '/widgets/', archiveName));
    devboxConfig.widgets = [path.join('/widgets/', archiveName)];
    jsonfile.writeFileSync(devboxConfigPath, devboxConfig, {
        spaces: 4
    });
    //install devbox dependencies(routerhelpers.js require node_modules folder)
    try {
        if (!fs.statSync(path.join(devboxPath, '/node_modules')).isDirectory()) {
            installDevBoxDependencies();
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            installDevBoxDependencies();
        } else {
            errorHandler(error);
        }
    }
    child_process.exec('node server.js', {
        cwd: devboxPath,
    }, function (err, stdout, stderr) {
        if (err) {
            console.error(err.toString());
            process.exit(1);
        }
        console.log(stdout);
    });
    open('http://localhost:8879/views/index.html');
    console.log('CTRL + C to shutdown');
});

