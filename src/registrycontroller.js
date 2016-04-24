(function () {
    'use strict';

    var jsonfile = require('jsonfile');
    var path = require('path');

    var registryPath = path.join(__dirname, '..', 'registry.json');

    var getRegistry = function () {
        try {
            return jsonfile.readFileSync(registryPath);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return {};
            } else {
                throw err;
            }
        }
    };

    exports.getWidgetsList = function () {
        var registry = getRegistry();

        if (!registry.widgets) {
            return {};
        }

        return registry.widgets;
    };

    exports.updateWidgetsList = function (widgetsList) {
        var registry = getRegistry();

        registry.widgets = widgetsList;
        try {
            jsonfile.writeFileSync(registryPath, registry, {
                spaces: 4
            });
        } catch (err) {
            console.error(err.toString());
            process.exit(1);
        }
    };

    exports.isWidgetNameUnique = function (name) {
        var widgetsList = this.getWidgetsList();

        return !widgetsList[name];
    };

    exports.addWidget = function (name, path) {
        var widgetsList = this.getWidgetsList();

        if (widgetsList[name]) {
            throw 'Widget with this name already exist.';
        }
        widgetsList[name] = {
            path: path
        };
        this.updateWidgetsList(widgetsList);
    };
})();