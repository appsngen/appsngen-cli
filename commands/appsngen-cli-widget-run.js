var program = require('commander');

program
    .option('--target <targetDevice>', 'Deploy to specific target')
    .option('--list', 'Lists available targets')
    .option('--release', 'Deploy a release build')
    .option('--nobuild', 'Skip building')
    .option('--browserify', 'Compile plugin JS at build time using browserify instead of runtime')
    .option('--buildConfig <configFile>', 'Use the specified build configuration file.')
    .parse(process.argv);

console.log('build-config: ' + JSON.stringify(program.parseOptions(process.argv)));