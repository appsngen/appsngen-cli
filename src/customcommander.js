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

    // remove appending ourselves to the end of the arguments,
    // for proper work 'help' command
    commander.Command.prototype.action = function(fn) {
        var that = this;
        var listener = function(args, unknown) {
            var parsed;
            // Parse any so-far unknown options
            args = args || [];
            unknown = unknown || [];
            parsed = that.parseOptions(unknown);

            // If there are still any unknown options, then we simply
            // die, unless someone asked for help, in which case we give it
            // to them, and then we die.
            if (parsed.unknown.length > 0) {
                that.unknownOption(parsed.unknown[0]);
            }

            // Leftover arguments need to be pushed back. Fixes issue #56
            if (parsed.args.length) {
                args = parsed.args.concat(args);
            }

            that._args.forEach(function(arg, i) {
                if (arg.required && args[i] === null) {
                    that.missingArgument(arg.name);
                } else if (arg.variadic) {
                    if (i !== that._args.length - 1) {
                        that.variadicArgNotLast(arg.name);
                    }

                    args[i] = args.splice(i);
                }
            });

            fn.apply(that, args);
        };
        var parent = this.parent || this;
        var name = parent === this ? '*' : this._name;

        parent.on(name, listener);
        if (this._alias) {
            parent.on(this._alias, listener);
        }
        return this;
    };

    module.exports = commander;
})();
