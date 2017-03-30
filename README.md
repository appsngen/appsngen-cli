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

`appsngen logout` - logout user from appsngen

`appsngen widget create <name> [path]` - generate basic project structure with given name (if path is specified, then generate project at given path).
Constrains for widget name:
* max length is 50 characters
* name shouldn't be empty (or consist only of whitespaces)
* should consist of latin letters, numbers or secial characters: ".", "-", "_".
* should be unique within organization

`appsngen widget build [widget_name] [options]` - build appsngen widget, if name is specified then run command in `widget_name` folder.
 * `--verbose` - prints all logs in time of build.

`appsngen widget preview [widget_name]` - preview widget locally in **dev-box**, if name is specified then run command in `widget_name` folder.

`appsngen widget deploy [widget_name]` - deploy widget to *appsngen.com*, if name is specified then run command in `widget_name` folder.

`appsngen widget list` - print list of widgets

`appsngen widget list add <name> <path>` - add widget to widgets list

`appsngen widget list remove <name> [option]` - remove widget from widgets list
  * `--hard` - remove project folder of widget
  * `--clear-all` - remove all widget from widgets list with their folders
