var program = require('commander');
var execSync = require('child_process').execSync;
var path = require('path');
var jsonfile = require('jsonfile');
var cordovacontroller = require('./../src/cordovacontroller');

var platforms, config, options, option, tmpString;
var buildArgs = '';
var runArgs = '';
var cordovaPath = path.join(process.cwd(), 'cordova');
var buildAcceptableArgs = ['release', 'browserify', 'buildConfig'];

program
    .option('--android', 'Build for android platform')
    .option('--ios', 'Build for ios platform')
    .option('--browser', 'Build for browser')
    .option('--list', 'Lists available targets')
    .option('--release', 'Deploy a release build')
    .option('--nobuild', 'Skip building')
    .option('--browserify', 'Compile plugin JS at build time using browserify instead of runtime')
    .option('--target <targetDevice>', 'Deploy to specific target')
    .option('--buildConfig <configFile>', 'Use the specified build configuration file.')
    .parse(process.argv);

options = program.opts();
platforms = cordovacontroller.parsePlatforms(options);
if (platforms.length === 0) {
    try {
        config = jsonfile.readFileSync(path.join(process.cwd(), './.appsngenrc'));
        platforms = ['browser -- --port=' + config.port];
    } catch (err) {
        console.error(err.toString());
        process.exit(1);
    }
}
platforms = platforms.reduce(function (prev, curr) {
    return prev + ' ' + curr;
}, '');
for (option in options) {
    if (options[option]) {
        if (typeof options[option] === 'boolean') {
            tmpString = ' --' + option;
        } else {
            tmpString = ' --' + option + '=' + options[option];
        }
        runArgs += tmpString;
        if (buildAcceptableArgs.indexOf(option) !== -1) {
            buildArgs += tmpString;
        }
    }
}
//rework build command argument list to call appsngen widget build command
console.log('BUILD RESULT COMMAND: ' + 'cordova build ' + platforms + buildArgs);
console.log('RUN RESULT COMMAND: ' + 'cordova run ' + platforms + runArgs);
if (!program.nobuild) {
    execSync('appsngen widget build ' + platforms + buildArgs, {
        stdio: 'inherit',
        cwd: cordovaPath
    });
}
execSync('cordova run ' + platforms + runArgs, {
    stdio: 'inherit',
    cwd: cordovaPath
});
