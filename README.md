# appsngen-cli [![Build Status](https://travis-ci.org/appsngen/appsngen-cli.svg?branch=master)](https://travis-ci.org/appsngen/appsngen-cli)
Command Line Interface to interact with AppsNgen API. It is a single enry point to AppsNgen capabilities such as:
* create widget
* preview widget locally
* upload widget to the AppsNgen system
* preview at AppsNgen website
* create native allication based on widget. Currently we use [Apache Cordova](https://cordova.apache.org/) for native applications generation

## Install

You should have installed **npm** and **node**(https://nodejs.org).

Run in terminal `npm install -g appsngen-cli`(for Mac add `sudo`)

## Usage

`appsngen login` - logins user to appsngen

`appsngen phonegap access [authToken]` - recive access token to work with PhoneGap Build service.

`appsngen widget create <name> [path]` - generate basic project structure with given name (if path is specified, then generate project at given path).

`appsngen widget build [widget_name] [options]` - build native appliaction for the specified platform (default value: `browser`), if name is specified then run command in `widget_name` folder. 
 * `--ios, --android, --browser` - build application for ios, android and browser platform respectively
 * `--release` - build release version
 * `--browserify` - compile plugin JS at build time using browserify instead of runtime
 * `--buildConfig <pathToConfigFile>` - use the specified build configuration file.
  
`appsngen widget run [widget_name] [options]` - run widget at specified platforms (default value: `browser`), if name is specified then run command in `widget_name` folder. 
 * `--ios, --android, --browser` - build application for ios, android and browser platform respectively
 * `--list` - lists available targets
 * `--release` - build release version
 * `--nobuild` - skip building
 * `--browserify` - compile plugin JS at build time using browserify instead of runtime
 * `--target <targetDevice>` - deploy to specific target
 * `--buildConfig <pathToConfigFile>` - use the specified build configuration file.

`appsngen widget preview [widget_name]` - preview widget locally in **dev-box**, if name is specified then run command in `widget_name` folder. 

`appsngen widget deploy [widget_name]` - deploy widget to *appsngen.com*, if name is specified then run command in `widget_name` folder. 

`appsngen widget remote keys` - lists all available signing keys for all platforms

`appsngen widget remote register [widget_name] [options]` - create new application at PhoneGap Build service, if `widget_name` specified then run command for widget with specified name.
* `--key-ios <keyId>` - to sign application with specified ios signing key
* `--key-android <keyId>` - to sign application with specified android signing key
 
`appsngen widget remote build [widget_name] [options]` - start build application for all platforms at PhoneGap Build, if `widget_name` specified then run command for widget with specified name.
* `--noupload` - to skip uploading phase
* `--platform <platform>` - start build for specific platform

`appsngen widget remote download [widget_name] <platform>` - download application for specified platform, if `widget_name` specified then run command for widget with specified name.

`appsngen widget list` - print list of widgets

`appsngen widget list add <name> <path>` - add widget to widgets list

`appsngen widget list remove <name> [option]` - remove widget from widgets list
  * `--hard` - remove project folder of widget
