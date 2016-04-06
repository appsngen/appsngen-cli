var jsonfile = require('jsonfile');
var path = require('path');
var Table = require('easy-table');

var registry, item;
var table = new Table();

try {
    registry = jsonfile.readFileSync(path.join(__dirname, '..', 'registry.json'));
    for (item in registry) {
        table.cell('Name', item);
        table.cell('Path', registry[item].path);
        table.newRow();
    }
    console.log(table.toString());
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('Widgets list is empty.');
        process.exit(0);
    } else {
        console.error(err.toString());
        process.exit(1);
    }
}