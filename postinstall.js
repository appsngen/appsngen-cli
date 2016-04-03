var config = require('./cli-config.json');
var semver = require('semver');
var execSync = require('child_process').execSync;

var installPackage = function (packageName) {
    execSync('npm install -g ' + packageName, {
        stdio: 'inherit'
    });
};
var dependency, info, packageInfo;

console.log('Check dependencies...');
for (dependency in config.dependencies) {
    try {
        info = execSync('npm list -g --depth=0 ' + dependency);
        packageInfo = info.toString().match(new RegExp(dependency + '@\\d\\.\\d\\.\\d', 'g'));
        if (!packageInfo || !semver.satisfies(packageInfo[0].match(/\d\.\d\.\d/g)[0], config.dependencies[dependency])) {
            installPackage(dependency);
        }
    } catch (e) {
        installPackage(dependency);
        continue;
    }
    console.log(dependency + ' version check complete.');
}
console.log('Post install checks completed.');