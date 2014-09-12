var Promise = require('bluebird');
var exec = require('child_process').exec;

function convert (args) {
    return run('convert', args);
}

function identify(args) {
    return run('identify', args).then(function (output) {
        var result = /(.+) ([A-Z]{3,4}) ([0-9]+)x([0-9]+) .+ ([0-9.]+)([A-Z]{2})/.exec(output);

        return {
            path: result[1],
            format: result[2],
            width: +result[3],
            height: +result[4],
            size: result[5] + result[6]
        };
    });
}

function run (command, args) {
    if (args instanceof Array) {
        args = args.join(' ');
    }

    var Image = require('./image');

    if (args instanceof Image) {
        args = args.path;
    }

    return new Promise(function (resolve, reject) {
        exec(command + ' ' + args, function (err, stdout) {
            if (err) {
                return reject(err);
            }

            resolve(stdout);
        });
    });
}

function extend (dest, src) {
    Object.keys(src).forEach(function (key) {
        dest[key] = src[key];
    });

    return dest;
};

module.exports = {
    convert: convert,
    identify: identify,
    run: run,
    extend: extend
};