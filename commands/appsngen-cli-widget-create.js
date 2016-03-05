#! /usr/bin/env node
var cliConfig = require('../cli-config.json');
var semver = require('semver');
var readline = require('readline');
var execSync = require('child_process').execSync;
var fs = require('fs');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var installPackage = function (packageName) {
    execSync('npm install -g ' + packageName, {stdio: 'inherit'});
};
var info, packageInfo, dependency, packageVersion, folderStat;

rl.question('Enter project folder name: ', function (folder) {
    rl.close();
    try {
        folderStat = fs.statSync('./' + folder);
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }
    if (folderStat && folderStat.isDirectory()) {
        console.log('Folder with that name already exist.');
        return;
    }
    fs.mkdirSync('./' + folder);

    for (dependency in cliConfig.dependencies) {
        try {
            info = execSync('npm list -g --depth=0 ' + dependency);
        } catch (e) {
            installPackage(dependency);
            continue;
        }
        packageInfo = info.toString().match(new RegExp(dependency + '@\\d\\.\\d\\.\\d', 'g'));
        if (!packageInfo || !semver.satisfies(packageInfo[0].match(/\d\.\d\.\d/g)[0], cliConfig.dependencies[dependency])) {
            installPackage(dependency);
        }
        console.log(dependency + ' version check complete.');
    }
    execSync('yo appsngen-web-widget', {
        cwd: './' + folder,
        stdio: 'inherit'
    });
});