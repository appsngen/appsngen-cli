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

`appsngen widget`, `appsngen widget create` - generate basic project structure

`appsngen widget build [platform]` - build native appliaction for the specified platform (default value: `browser`)

`appsngen widget preview` - preview widget locally in **dev-box**

`appsngen widget deploy` - deploy widget to *appsngen.com*
