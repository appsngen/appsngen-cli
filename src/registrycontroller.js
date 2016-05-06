(function () {
    'use strict';

    var jsonfile = require('jsonfile');
    var path = require('path');

    var registryPath = path.join(__dirname, '..', 'registry.json');

    var getRegistry = function () {
        try {
            return jsonfile.readFileSync(registryPath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return {};
            } else {
                throw error;
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
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };

    exports.addWidget = function (name, path) {
        var widgetsList = this.getWidgetsList();
        
        widgetsList[name] = {
            path: path
        };
        this.updateWidgetsList(widgetsList);
    };
})();
