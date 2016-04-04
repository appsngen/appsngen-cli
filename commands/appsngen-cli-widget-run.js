var program = require('commander');
var execSync = require('child_process').execSync;
var path = require('path');
var jsonfile = require('jsonfile');

var platforms, config, options, option, tmpString;
var buildArgs = '';
var runArgs = '';
var buildAcceptableArgs = ['release', 'browserify', 'buildConfig'];

program
    .arguments('[platforms...]')
    .option('--list', 'Lists available targets')
    .option('--release', 'Deploy a release build')
    .option('--nobuild', 'Skip building')
    .option('--browserify', 'Compile plugin JS at build time using browserify instead of runtime')
    .option('--target <targetDevice>', 'Deploy to specific target')
    .option('--buildConfig <configFile>', 'Use the specified build configuration file.')
    .action(function(arg) {
        platforms = arg;
    })
    .parse(process.argv);
options = program.opts();
if (!platforms) {
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
if (!program.nobuild) {
    execSync('appsngen widget build ' + platforms + buildArgs, {
        stdio: 'inherit'
    });
}
execSync('cordova run ' + platforms + runArgs, {
    stdio: 'inherit',
    cwd: path.join(process.cwd(), '/cordova')
});
