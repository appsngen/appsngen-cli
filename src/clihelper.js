(function () {
    var path = require('path');
    var bluebird = require('bluebird');
    var Promise = bluebird.Promise;
    var statSync = require('fs').statSync;

    //add file extension to current file in this extension not exists
    exports.normalizePathToCurrentFile = function () {
        var currentFile = process.argv[1];
        if (path.extname(currentFile) !== '.js') {
            currentFile += '.js';
        }
        process.argv[1] = currentFile;
    };

    exports.validateWidgetName = function (name) {
        //TODO implement mechanism to check widget name via web call
        return Promise.resolve(!!name);
    };
    
    exports.isProjectFolder = function (widgetPath) {
        //TODO create more complete check
        try {
            return !!statSync(path.join(widgetPath, '.appsngenrc'));
        } catch (err) {
            if (err.code === 'ENOENT') {
                return false
            } else {
                throw err;
            }
        }
    };
})();