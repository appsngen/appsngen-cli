(function () {
    var path = require('path');

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
})();