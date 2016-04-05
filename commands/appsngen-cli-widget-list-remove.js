var program = require('commander');
var bluebird = require('bluebird');
var rmdir = require('rmdir');
var Promise = bluebird.Promise;
var jsonfile = require('jsonfile');
var path = require('path');

var widgetName, registry;
var registryPath = path.join(__dirname, '..', 'registry.json');

program
    .arguments('<name>')
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
        new Promise(function (resolve, reject) {
            if (program.hard) {
                rmdir(registry[widgetName].path, function (err) {
                    if(err) {
                        reject(err);
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        }).then(function () {
            registry[widgetName] = undefined;
            jsonfile.writeFileSync(registryPath, registry, {
                spaces: 4
            });
        }).catch(function (err) {
            console.error(err.toString());
            process.exit(1);
        });
    }
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('Widgets list is empty.');
    } else {
        console.error(err);
    }
    process.exit(1);
}