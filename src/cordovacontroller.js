(function () {
    'use strict';

    /*jshint multistr: true */

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
            '(function () {\n\
                var createApplication = function() {\n\
                    var div;\n\
                    var location = window.location;\n\
                    var parent = location.protocol + "//" + location.host;\n\
                    var changedParams = {};\n\
                    var settings = {\n\
                        width: "100%",\n\
                        height: "100%",\n\
                        frameborder: "0",\n\
                        scrolling: "auto"\n\
                    };\n\
                    var url = "' + widgetURL + '";\n\
                    url = url.replace(new RegExp("([\\\\?&]parent=)[^&]+"), "$1" + encodeURIComponent(parent));\n\
                    for (key in changedParams) {\n\
                        if (changedParams.hasOwnProperty(key)) {\n\
                            url += "&" + key + "=" + changedParams[key];\n\
                        }\n\
                    }\n\
                    div = document.getElementById("' + urn + '");\n\
                    div.setAttribute("id", div.getAttribute("id") + appstore.util.guid());\n\
                    appstore.addApplication("' + widgetName +'" + "-" + appstore.util.guid(), div.getAttribute("id"), settings, url);\n\
                };\n\
                var addScriptLoadHandler = function (script, handler) {\n\
                    var scriptIsLoaded = false;\n\
                    var previousHandler = script.onload;\n\
                    // IE8 hack\n\
                    script.onload = script.onerror = script.onreadystatechange = function () {\n\
                        if (!scriptIsLoaded && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {\n\
                            scriptIsLoaded = true;\n\
                            if (previousHandler) {\n\
                                previousHandler.call(script);\n\
                            }\n\
                            handler.call(script);\n\
                            // IE8 memory leak fix\n\
                            script.onload = script.onerror = script.onreadystatechange = null;\n\
                        }\n\
                    };\n\
                };\n\
                var createScript = function(callback) {\n\
                    var scriptId = "appstore-container-api";\n\
                    var script;\n\
                    script = document.getElementById(scriptId);\n\
                    if (script) {\n\
                        if (window.appstore && window.appstore.apiVersion === "container") {\n\
                            callback();\n\
                        } else {\n\
                            addScriptLoadHandler(script, function () {\n\
                                callback();\n\
                            });\n\
                        }\n\
                    } else {\n\
                        script = document.createElement("script");\n\
                        script.src = "' + viewerEndpoint + '/content/js/appsngen.container.api.js";\n\
                        script.setAttribute("id", scriptId);\n\
                        addScriptLoadHandler(script, function () {\n\
                            callback();\n\
                        });\n\
                        document.body.appendChild(script);\n\
                    }\n\
                };\n\
                var container = document.createElement("div");\n\
                container.id = "' + urn + '";\n\
                document.body.appendChild(container);\n\
                if (window.appstore && window.appstore.apiVersion === "widget") {\n\
                    appstore.ready(createApplication);\n\
                } else if (window.appstore && window.appstore.apiVersion === "container"){\n\
                    createApplication();\n\
                } else {\n\
                    createScript(function () {\n\
                        if (window.appstore) {\n\
                            createApplication();\n\
                        } else if (window.console && window.console.error) {\n\
                            window.console.error("Cannot render widget: appsngen api loading failure");\n\
                        }\n\
                    });\n\
                }\n\
            }());');
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
                        'file://',
                        'http://localhost:8000'
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
                    console.error(error.toString());
                    throw error;
                } else {
                    console.log('Response recieved');
                    writeIntegrationFile(response.body.accessToken, rcConfig.urn, config.serviceAddress);
                }
            }
        );
    };
})();