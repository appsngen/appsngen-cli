(function () {
    'use strict';

    var jsonfile = require('jsonfile');
    var path = require('path');
    var mkdirp = require('mkdirp');

    var registryPath = path.join(process.env.HOME || process.env.USERPROFILE, '.appsngen-cli', 'registry.json');

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

    var updateRegistry = function (registry) {
        try {
            jsonfile.writeFileSync(registryPath, registry, {
                spaces: 4
            });
        } catch (error) {
            if (error.code === 'ENOENT') {
                mkdirp.sync(path.dirname(registryPath));
                updateRegistry(registry);
            } else {
                console.error(error.toString());
                process.exit(1);
            }
        }
    };

    exports.addCredentials = function (name, credentials) {
        var registry = getRegistry();

        registry.credentials = registry.credentials || {};
        registry.credentials[name] = credentials;
        updateRegistry(registry);
    };

    exports.removeCredentials = function () {
        var registry = getRegistry();

        registry.credentials = null;
        updateRegistry(registry);
    };

    exports.getCredentials = function() {
        var registry = getRegistry();

        return registry.credentials || {};
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
        updateRegistry(registry);
    };

    exports.addWidget = function (name, path) {
        var widgetsList = this.getWidgetsList();

        widgetsList[name] = {
            path: path
        };
        this.updateWidgetsList(widgetsList);
    };
})();
