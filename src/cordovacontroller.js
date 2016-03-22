(function () {
    'use strict';

    var path = require('path');
    var execSync = require('child_process').execSync;
    var jsonfile = require('jsonfile');
    var request = require('request');
    var fs = require('fs');
    var config = require('./../cli-config.json');
    var authcontroller = require('./authcontroller');

    var rcFilePath = path.join(process.cwd(), '/.appsngenrc');
    var writeIntegrationFile = function (token, urn, serviceAddress) {
        var viewerEndpoint = serviceAddress + '/viewer';
        var widgetURL = serviceAddress + '/viewer/content/widgets/' + urn + '/index.html?parent=file%3A%2F%2F&token=' +
                        encodeURIComponent(token);
        var widgetName = urn.split(':').pop();

        try {
            fs.writeFileSync(path.join(process.cwd(), '/cordova/www/js/integration.js'),
            `(function () {
                var createApplication = function() {
                    var div;
                    var location = window.location;
                    var parent = location.protocol + '//' + location.host;
                    var changedParams = {};
                    var settings = {
                        width: '600px',
                        height: '454px',
                        frameborder: '0',
                        scrolling: 'auto'
                    };
                    var url = '${widgetURL}';
                    url = url.replace(new RegExp('([\\?&]parent=)[^&]+'), '$1' + encodeURIComponent(parent));

                    for (key in changedParams) {
                        if (changedParams.hasOwnProperty(key)) {
                            url += '&' + key + '=' + changedParams[key];
                        }
                    }

                    div = document.getElementById('${urn}');
                    div.setAttribute('id', div.getAttribute('id') + appstore.util.guid());
                    appstore.addApplication('${widgetName}' + '-' + appstore.util.guid(), div.getAttribute('id'), settings, url);
                };

                var addScriptLoadHandler = function (script, handler) {
                    var scriptIsLoaded = false;
                    var previousHandler = script.onload;

                    // IE8 hack
                    script.onload = script.onerror = script.onreadystatechange = function () {
                        if (!scriptIsLoaded && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                            scriptIsLoaded = true;

                            if (previousHandler) {
                                previousHandler.call(script);
                            }

                            handler.call(script);

                            // IE8 memory leak fix
                            script.onload = script.onerror = script.onreadystatechange = null;
                        }
                    };
                };
                var createScript = function(callback) {
                    var scriptId = 'appstore-container-api';
                    var script;

                    script = document.getElementById(scriptId);
                    if (script) {
                        if (window.appstore && window.appstore.apiVersion === 'container') {
                            callback();
                        } else {
                            addScriptLoadHandler(script, function () {
                                callback();
                            });
                        }
                    } else {
                        script = document.createElement('script');
                        script.src = '${viewerEndpoint}/content/js/appsngen.container.api.js';
                        script.setAttribute('id', scriptId);
                        addScriptLoadHandler(script, function () {
                            callback();
                        });

                        document.body.appendChild(script);
                    }
                };

                var container = document.createElement('div');
                container.id = '${urn}';
                document.body.appendChild(container);

                if (window.appstore && window.appstore.apiVersion === 'widget') {
                    appstore.ready(createApplication);
                } else if (window.appstore && window.appstore.apiVersion === 'container'){
                    createApplication();
                } else {
                    createScript(function () {
                        if (window.appstore) {
                            createApplication();
                        } else if (window.console && window.console.error) {
                            window.console.error('Cannot render widget: appsngen api loading failure');
                        }
                    });
                }
            }());`);
            console.log('Integration file updated.');
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };

    exports.create = function () {
        var packageConfig, rcConfig;
        try {
            packageConfig = jsonfile.readFileSync(path.join(process.cwd(),'/package.json'));
            execSync('cordova create cordova io.cordova.helloappsngen ' + packageConfig.name +
            ' --template="' + path.join(__dirname, '/../template"'), {
                stdio: 'inherit'
            });
            rcConfig = jsonfile.readFileSync(rcFilePath);
            rcConfig.cordova = {
                platforms: []
            };
            jsonfile.writeFileSync(rcFilePath, rcConfig, {
                spaces: 4
            });
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };


    exports.addPlatform = function (platform) {
        var rcConfig;

        execSync('cordova platform add ' + platform, {
            stdio: 'inherit',
            cwd: path.join(process.cwd(), '/cordova')
        });
        try {
            rcConfig = jsonfile.readFileSync(rcFilePath);
            rcConfig.cordova.platforms.push(platform);
            jsonfile.writeFileSync(rcFilePath, rcConfig, {
                spaces: 4
            });
        } catch (error) {
            console.error(error.toString());
            process.exit(1);
        }
    };

    exports.modify = function () {
        var rcConfig = jsonfile.readFileSync(rcFilePath);

        request.post(
            config.serviceAddress +  '/rest-services/tokens/access',
            {
                body: {
                    scope: {
                        widgets: [
                            rcConfig.urn
                        ]
                    },
                    domains: [
                        'file://'
                    ]
                },
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + authcontroller.getIdentityToken()
                }
            },
            function (error, response) {
                if (error) {
                    console.log('build command error');
                    throw error;
                } else {
                    console.log('Response recieved');
                    writeIntegrationFile(response.body.accessToken, rcConfig.urn, config.serviceAddress);
                }
            }
        );
    };
})();