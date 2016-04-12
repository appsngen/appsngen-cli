var program = require('./../src/customcommander');
var rmdir = require('rmdir');
var jsonfile = require('jsonfile');
var path = require('path');

var widgetName, registry;
var registryPath = path.join(__dirname, '..', 'registry.json');

var removeRegistryRecord = function (name) {
    registry[name] = undefined;
    jsonfile.writeFileSync(registryPath, registry, {
        spaces: 4
    });
};

program
    .alias('appsngen widget list remove')
    .arguments('<name>')
    .usage('<name> [option]')
    .option('--hard', 'delete widget folder')
    .action(function (name) {
        widgetName = name;
    })
    .parse(process.argv);

if (typeof widgetName === 'undefined') {
    program.help();
}

try {
    registry = jsonfile.readFileSync(registryPath);
    if (registry[widgetName]) {
        if (program.hard) {
            rmdir(registry[widgetName].path, function (err) {
                if(err) {
                    throw err;
                }
                removeRegistryRecord(widgetName);
            });
        } else {
            removeRegistryRecord(widgetName);
        }
    }
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('Widgets list is empty.');
    } else {
        console.error(err);
    }
    process.exit(1);
}