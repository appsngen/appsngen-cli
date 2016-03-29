var program = require('commander');
var execSync = require('child_process').execSync;
var path = require('path');

var platforms;
var resultCommand = 'cordova run';

program
    .arguments('[platforms...]')
    .option('--list', 'Lists available targets')
    .option('--release', 'Deploy a release build')
    .option('--nobuild', 'Skip building')
    .option('--browserify', 'Compile plugin JS at build time using browserify instead of runtime')
    .option('--target <targetDevice>', 'Deploy to specific target')
    .option('--buildConfig <configFile>', 'Use the specified build configuration file.')
    .option('--platformSpecific <platformOptions>', 'Provide platform specific options')
    .action(function(arg) {
        platforms = arg;
    })
    .parse(process.argv);

platforms = platforms || ['browser'];
platforms.forEach(function (el) {
    resultCommand += ' ' + el;
});
['list', 'release', 'nobuild', 'browserify'].forEach(function (el) {
    if (program[el]) {
        resultCommand += ' --' + el;
    }
});
['target', 'buildConfig', 'platformSpecific'].forEach(function (el) {
    if (program[el]) {
        resultCommand += ' --' + (el === 'platformSpecific' ? ' ' : el + '=') +
            program[el];
    }
});
execSync(resultCommand, {
    stdio: 'inherit',
    cwd: path.join(process.cwd(), '/cordova')
});