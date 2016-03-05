#! /usr/bin/env node
var cliConfig = require('../cli-config.json');
var semver = require('semver');
var execSync = require('child_process').execSync;
var installPackage = function (packageName) {
    execSync('npm install -g ' + packageName, {stdio: 'inherit'});
};
var info, packageInfo, dependency, packageVersion;

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
execSync('yo appsngen-web-widget', {stdio: 'inherit'});