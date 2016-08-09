(function () {
    'use strict';

    var commander = require('commander');

    // overload function for custom help information
    // require for every command define alias
    commander.Command.prototype.helpInformation = function () {
        var usage, options;
        var desc = [];
        var cmds = [];
        var cmdName = this._name.split('-').join(' ');
        var commandHelp = this.commandHelp();

        if (this._description) {
            desc = [
                '  ' + this._description,
                ''
            ];
        }

        usage = [
            '',
            '  Usage: ' + cmdName + ' ' + this.usage(),
            ''
        ];

        if (commandHelp) {
            cmds = [commandHelp];
        }

        options = [
            '  Options:',
            '',
            this.optionHelp().replace(/^/gm, '    ').toString(),
            '',
            ''
        ];

        return usage
            .concat(cmds)
            .concat(desc)
            .concat(options)
            .join('\n');
    };

    module.exports = commander;
})();
