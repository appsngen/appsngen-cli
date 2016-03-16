var uploader = require('./../src/uploadcontroller');
var jsonfile = require('jsonfile');

jsonfile.readFile(process.cwd() + '/.appsngenrc', function(err, obj) {
    if (typeof obj !== 'undefined') {
        uploader.uploadWidget(obj);
    } else {
        console.error('Configuration file not found.');
    }
});
