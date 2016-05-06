(function () {
    'use strict';

    var Table = require('easy-table');
    var registrycontroller = require('./../src/registrycontroller');

    var widget;
    var widgetsList = registrycontroller.getWidgetsList();
    var table = new Table();

    for (widget in widgetsList) {
        if (widgetsList.hasOwnProperty(widget)) {
            table.cell('Name', widget);
            table.cell('Path', widgetsList[widget].path);
            table.newRow();
        }
    }
    if (table.rows.length) {
        console.log(table.toString());
    } else {
        console.log('Widgets list is empty.');
    }
})();
