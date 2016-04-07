# appsngen-cli [![Build Status](https://travis-ci.org/appsngen/appsngen-cli.svg?branch=master)](https://travis-ci.org/appsngen/appsngen-cli)
Command Line Interface to interact with AppsNgen API. It is a single enry point to AppsNgen capabilities such as:
* create widget
* preview widget locally
* upload widget to the AppsNgen system
* preview at AppsNgen website
* create native allication based on widget. Currently we use [Apache Cordova](https://cordova.apache.org/) for native applications generation

## Install

You should have installed **npm** and **node**(https://nodejs.org).

1. Download repository(https://github.com/appsngen/appsngen-cli.git)
2. Unpack it, and go to **appsngen-cli** folder
3. Run `npm install -g`(for Mac and Unix add `sudo`)

## Usage

`appsngen login` - logins user to appsngen

`appsngen widget create <name> [path]` - generate basic project structure with given name (if path is specified, then generate project at given path).

`appsngen widget build [widget_name]` - build native appliaction for the specified platform (default value: `browser`), if name is specified then run command in `widget_name` folder. 
 * `--ios, --android, --browser` - build application for ios, android and browser platform respectively
 * `--release` - build release version
 * `--browserify` - compile plugin JS at build time using browserify instead of runtime
 * `--buildConfig <pathToConfigFile>` - use the specified build configuration file.
  
`appsngen widget run [widget_name]` - run widget at specified platforms (default value: `browser`), if name is specified then run command in `widget_name` folder. 
 * `--ios, --android, --browser` - build application for ios, android and browser platform respectively
 * `--list` - lists available targets
 * `--release` - build release version
 * `--nobuild` - skip building
 * `--browserify` - compile plugin JS at build time using browserify instead of runtime
 * `--target <targetDevice>` - deploy to specific target
 * `--buildConfig <pathToConfigFile>` - use the specified build configuration file.

`appsngen widget preview [widget_name]` - preview widget locally in **dev-box**, if name is specified then run command in `widget_name` folder. 

`appsngen widget deploy [widget_name]` - deploy widget to *appsngen.com*, if name is specified then run command in `widget_name` folder. 

`appsngen widget list` - print list of widgets

`appsngen widget list add <name> <path>` - add widget to widgets list

`appsngen widget list remove <name>` - remove widget from widgets list
  * `--hard` - remove project folder of widget
